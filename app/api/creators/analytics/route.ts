import { NextRequest, NextResponse } from 'next/server'
import { connectDb } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { CreatorModel } from '@/models/User'
import { PostModel } from '@/models/Post'
import { PurchaseModel } from '@/models/Purchase'
import { SubscriptionModel } from '@/models/Subscription'

export async function GET(req: NextRequest) {
    try {
        await connectDb()
        const authHeader = req.headers.get('authorization')
        if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const payload = verifyToken(authHeader.split(' ')[1])
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

        // Get Creator
        const creator = await CreatorModel.findOne({ walletAddress: payload.walletAddress }).lean()
        if (!creator) return NextResponse.json({ error: 'Creator not found' }, { status: 404 })

        // Get Posts
        const posts = await PostModel.find({ creatorId: creator._id }).lean()

        // Get Unlocks (Purchases)
        const unlocks = await PurchaseModel.find({
            postId: { $in: posts.map(p => p._id) }
        }).lean()

        // Get Subscriptions
        const subscriptions = await SubscriptionModel.find({ creator: payload.walletAddress }).lean()

        // Aggregate
        const totalUnlocks = unlocks.reduce((a, b) => a + (Number(b.amount) / 1e6), 0)
        const totalSubs = subscriptions.reduce((a, b) => a + (Number((b as any).totalPaid || 0)), 0)

        // Monthly growth (Last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const newSubsCount = await SubscriptionModel.countDocuments({
            creator: payload.walletAddress,
            createdAt: { $gte: thirtyDaysAgo }
        })

        const activeSubsCount = await SubscriptionModel.countDocuments({
            creator: payload.walletAddress,
            isActive: true
        })

        // Engagement: Top performing posts (by unlocks count)
        const purchaseCounts = unlocks.reduce((acc: any, curr: any) => {
            const postId = curr.postId.toString()
            acc[postId] = (acc[postId] || 0) + 1
            return acc
        }, {}) as Record<string, number>

        const topPosts = [...posts].sort((a, b) => (purchaseCounts[b._id.toString()] || 0) - (purchaseCounts[a._id.toString()] || 0)).slice(0, 5)

        return NextResponse.json({
            overview: {
                totalRevenue: totalUnlocks + totalSubs,
                unlockRevenue: totalUnlocks,
                subscriptionRevenue: totalSubs,
                activeSubscribers: activeSubsCount,
                newSubscribersLast30Days: newSubsCount
            },
            topPosts: topPosts.map(p => ({
                id: p._id,
                unlocks: purchaseCounts[p._id.toString()] || 0,
                price: p.priceUSDC
            })),
            engagement: {
                averageUnlocksPerPost: unlocks.length / (posts.length || 1)
            }
        })
    } catch (e) {
        console.error('Analytics error:', e)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
