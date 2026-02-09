import { NextRequest, NextResponse } from 'next/server'
import { connectDb } from '@/lib/db'
import PurchaseModel from '@/models/Purchase'
import PostModel from '@/models/Post'
import SubscriptionModel from '@/models/Subscription'
import CreatorModel from '@/models/Creator'
import { verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization')
        if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const payload = verifyToken(authHeader.split(' ')[1])
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

        await connectDb()
        const creator = await CreatorModel.findOne({ walletAddress: payload.walletAddress })
        if (!creator) return NextResponse.json({ error: 'Creator not found' }, { status: 404 })

        const posts = await PostModel.find({ creatorId: creator._id })
        const postIds = posts.map(p => p._id)

        // Earnings by type (Unlock vs Tip vs Subscription)
        const unlocks = await PurchaseModel.find({ postId: { $in: postIds } })
        const subscriptions = await SubscriptionModel.find({ creator: payload.walletAddress })

        // Tipping stats (assuming we can identify tips in Notification or a new Tip model)
        // For now, let's aggregate Unlocks and Subscriptions

        const totalUnlocks = unlocks.reduce((a, b) => a + (b.amount / 1e6), 0)
        const totalSubs = subscriptions.reduce((a, b) => a + (b.totalPaid || 0), 0)

        // Monthly growth (Last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const newSubs = await SubscriptionModel.countDocuments({
            creator: payload.walletAddress,
            createdAt: { $gte: thirtyDaysAgo }
        })

        // Engagement: Top performing posts
        const topPosts = posts.sort((a, b) => (b.unlockedUsers?.length || 0) - (a.unlockedUsers?.length || 0)).slice(0, 5)

        return NextResponse.json({
            overview: {
                totalRevenue: totalUnlocks + totalSubs,
                unlockRevenue: totalUnlocks,
                subscriptionRevenue: totalSubs,
                activeSubscribers: await SubscriptionModel.countDocuments({ creator: payload.walletAddress, isActive: true }),
                newSubscribersLast30Days: newSubs
            },
            topPosts: topPosts.map(p => ({
                id: p._id,
                unlocks: p.unlockedUsers?.length || 0,
                price: p.priceUSDC
            })),
            engagement: {
                averageUnlocksPerPost: totalUnlocks / (posts.length || 1)
            }
        })
    } catch (e) {
        console.error('Analytics error:', e)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
