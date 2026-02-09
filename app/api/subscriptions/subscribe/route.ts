import { NextRequest, NextResponse } from 'next/server'
import { connectDb } from '@/lib/db'
import SubscriptionModel from '@/models/Subscription'
import SubscriptionTierModel from '@/models/SubscriptionTier'
import { getConnection, calculateUSDCSpit } from '@/lib/solana'
import { verifyToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
    try {
        await connectDb()
        const { txSignature, tierId, subscriberWallet } = await req.json()

        // Auth check
        const authHeader = req.headers.get('authorization')
        if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const payload = verifyToken(authHeader.split(' ')[1])
        if (!payload || payload.walletAddress !== subscriberWallet) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

        const tier = await SubscriptionTierModel.findById(tierId)
        if (!tier) return NextResponse.json({ error: 'Tier not found' }, { status: 404 })

        // Verify on-chain transaction
        const conn = getConnection()
        const tx = await conn.getParsedTransaction(txSignature, 'confirmed')
        if (!tx || !tx.meta) return NextResponse.json({ error: 'Transaction not found or invalid' }, { status: 400 })

        const { totalBaseUnits } = calculateUSDCSpit(tier.price)

        // Sum up USDC transfers
        const inner = (tx.meta.innerInstructions || []) as any[]
        const allInstructions = [...tx.transaction.message.instructions, ...inner.flatMap(ii => ii.instructions)]
        const totalUSDC = allInstructions.reduce((sum, inst) => {
            if (inst.program === 'spl-token' && inst.parsed?.type === 'transfer') {
                return sum + Number(inst.parsed.info.amount)
            }
            return sum
        }, 0)

        if (totalUSDC < totalBaseUnits) {
            return NextResponse.json({ error: 'Insufficient payment detected' }, { status: 400 })
        }

        // Deactivate old active subscriptions for this creator
        await SubscriptionModel.updateMany(
            { subscriber: subscriberWallet, creator: tier.creator, isActive: true },
            { isActive: false }
        )

        // Create new subscription entry
        const now = new Date()
        const endDate = new Date(now)
        endDate.setMonth(now.getMonth() + 1)

        const sub = new SubscriptionModel({
            subscriber: subscriberWallet,
            creator: tier.creator,
            tierId: tier._id,
            startDate: now,
            endDate: endDate,
            isActive: true,
            lastPaymentDate: now,
            totalPaid: tier.price
        })

        await sub.save()
        return NextResponse.json({ success: true, sub })
    } catch (e) {
        console.error('Subscription error:', e)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
