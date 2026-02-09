import { NextRequest, NextResponse } from 'next/server'
import { turso } from '@/lib/turso'
import { getConnection, calculateUSDCSpit, calculateReferralSplit } from '@/lib/solana'
import { verifyToken } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
    try {
        const { txSignature, creatorWallet, amountUSDC } = await req.json()

        // Auth check
        const authHeader = req.headers.get('authorization')
        if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const payload = verifyToken(authHeader.split(' ')[1])
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

        // Verify on-chain
        const conn = getConnection()
        const tx = await conn.getParsedTransaction(txSignature, 'confirmed')
        if (!tx || !tx.meta) return NextResponse.json({ error: 'Transaction invalid' }, { status: 400 })

        const creatorRes = await turso.execute({
            sql: 'SELECT * FROM creators WHERE walletAddress = ?',
            args: [creatorWallet]
        })
        if (creatorRes.rows.length === 0) return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
        const creator = creatorRes.rows[0]

        // Check if creator has a referrer
        let expectedTotal: number
        if (creator.referredBy) {
            const { totalBaseUnits } = calculateReferralSplit(amountUSDC)
            expectedTotal = totalBaseUnits
        } else {
            const { totalBaseUnits } = calculateUSDCSpit(amountUSDC)
            expectedTotal = totalBaseUnits
        }

        const inner = (tx.meta.innerInstructions || []) as any[]
        const allInstructions = [...tx.transaction.message.instructions, ...inner.flatMap(ii => ii.instructions)]
        let totalUSDC = 0
        for (const inst of allInstructions) {
            if ((inst.program === 'spl-token' || inst.programId?.toString() === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') && (inst.parsed?.type === 'transfer' || inst.parsed?.type === 'transferChecked')) {
                totalUSDC += Number(inst.parsed?.info?.amount || inst.parsed?.info?.tokenAmount?.amount || 0)
            }
        }

        if (totalUSDC < expectedTotal) {
            console.warn(`Tip amount mismatch: got ${totalUSDC}, expected ${expectedTotal}`)
            // return NextResponse.json({ error: 'Payment amount mismatch' }, { status: 400 })
        }

        // Notify creator
        const notifId = uuidv4()
        await turso.execute({
            sql: `INSERT INTO notifications (id, recipient, sender, type, message, amount) VALUES (?, ?, ?, 'tip', ?, ?)`,
            args: [
                notifId,
                creatorWallet,
                payload.walletAddress,
                `You received a ${amountUSDC} USDC tip!`,
                expectedTotal
            ]
        })

        return NextResponse.json({ success: true })
    } catch (e) {
        console.error('Tip error:', e)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
