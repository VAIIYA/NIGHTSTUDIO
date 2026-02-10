import { NextRequest, NextResponse } from 'next/server'
import { connectDb } from '@/lib/db'
import { getConnection, calculateUSDCSpit, calculateReferralSplit } from '@/lib/solana'
import { verifyToken } from '@/lib/auth'
import { CreatorModel } from '@/models/User'
import { NotificationModel } from '@/models/Subscription'

export async function POST(req: NextRequest) {
    try {
        await connectDb()
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

        const creator = await CreatorModel.findOne({ walletAddress: creatorWallet }).lean()
        if (!creator) return NextResponse.json({ error: 'Creator not found' }, { status: 404 })

        // Check if creator has a referrer
        let expectedTotal: number
        if ((creator as any).referredBy) {
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
        }

        // Notify creator
        const notification = new NotificationModel({
            recipient: creatorWallet,
            sender: payload.walletAddress,
            type: 'tip',
            message: `You received a ${amountUSDC} USDC tip!`,
            amount: expectedTotal
        })
        await notification.save()

        return NextResponse.json({ success: true })
    } catch (e) {
        console.error('Tip error:', e)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
