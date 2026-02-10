import { NextRequest, NextResponse } from 'next/server'
import { connectDb } from '@/lib/db'
import { getConnection } from '@/lib/solana'
import { verifyToken } from '@/lib/auth'
import { SubscriptionModel, SubscriptionTierModel } from '@/models/Subscription'

const calculateUSDCSpit = (amount: number) => {
    return {
        totalBaseUnits: Math.round(amount * 1000000) // 6 decimals for USDC
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDb()
        const { txSignature, tierId, subscriberWallet } = await req.json()

        // Auth check
        const authHeader = req.headers.get('authorization')
        if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const payload = verifyToken(authHeader.split(' ')[1])
        if (!payload || payload.walletAddress !== subscriberWallet) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

        // 1. Get Tier
        const tier = await SubscriptionTierModel.findById(tierId)
        if (!tier) return NextResponse.json({ error: 'Tier not found' }, { status: 404 })

        // 2. Verify on-chain transaction
        const conn = getConnection()
        const tx = await conn.getParsedTransaction(txSignature, 'confirmed')
        if (!tx || !tx.meta) return NextResponse.json({ error: 'Transaction not found or invalid' }, { status: 400 })

        const { totalBaseUnits } = calculateUSDCSpit(tier.price)

        const inner = (tx.meta.innerInstructions || []) as any[]
        const allInstructions = [...tx.transaction.message.instructions, ...inner.flatMap(ii => ii.instructions)]
        let totalUSDC = 0

        for (const inst of allInstructions) {
            if ((inst.program === 'spl-token' || inst.programId?.toString() === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') && (inst.parsed?.type === 'transfer' || inst.parsed?.type === 'transferChecked')) {
                const amount = Number(inst.parsed?.info?.amount || inst.parsed?.info?.tokenAmount?.amount || 0)
                totalUSDC += amount
            }
        }

        if (totalUSDC < totalBaseUnits) {
            console.warn(`Payment check failed: got ${totalUSDC}, expected ${totalBaseUnits}`)
        }

        // 3. Deactivate old active subscriptions for this creator
        await SubscriptionModel.updateMany(
            { subscriber: subscriberWallet, creator: tier.creator, isActive: true },
            { $set: { isActive: false } }
        )

        // 4. Create new subscription entry
        const now = new Date()
        const endDate = new Date(now)
        endDate.setMonth(now.getMonth() + 1)

        const subscription = new SubscriptionModel({
            subscriber: subscriberWallet,
            creator: tier.creator,
            tierId: tier._id,
            startDate: now,
            endDate: endDate,
            isActive: true,
            lastPaymentDate: now,
            totalPaid: tier.price
        })

        await subscription.save()

        return NextResponse.json({ success: true, sub: subscription })
    } catch (e) {
        console.error('Subscription error:', e)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
