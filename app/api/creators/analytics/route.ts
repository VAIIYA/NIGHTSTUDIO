import { NextRequest, NextResponse } from 'next/server'
import { turso } from '@/lib/turso'
import { verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization')
        if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const payload = verifyToken(authHeader.split(' ')[1])
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

        // Get Creator
        const creatorRes = await turso.execute({
            sql: 'SELECT * FROM creators WHERE walletAddress = ?',
            args: [payload.walletAddress]
        })
        if (creatorRes.rows.length === 0) return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
        const creator = creatorRes.rows[0]

        // Get Posts
        const postsRes = await turso.execute({
            sql: 'SELECT * FROM posts WHERE creatorId = ?',
            args: [creator.id]
        })
        const posts = postsRes.rows

        // Get Unlocks (Purchases)
        const unlocksRes = await turso.execute({
            sql: `
                SELECT pu.* 
                FROM purchases pu
                JOIN posts po ON pu.postId = po.id
                WHERE po.creatorId = ?
            `,
            args: [creator.id]
        })
        const unlocks = unlocksRes.rows

        // Get Subscriptions
        const subsRes = await turso.execute({
            sql: 'SELECT * FROM subscriptions WHERE creator = ?',
            args: [payload.walletAddress]
        })
        const subscriptions = subsRes.rows

        // Aggregate
        const totalUnlocks = unlocks.reduce((a, b) => a + (Number(b.amount) / 1e6), 0)
        const totalSubs = subscriptions.reduce((a, b) => a + (Number(b.totalPaid || 0)), 0)

        // Monthly growth (Last 30 days)
        // Turso/SQLite date diff
        const newSubsRes = await turso.execute({
            sql: `SELECT COUNT(*) as count FROM subscriptions 
                  WHERE creator = ? AND createdAt >= datetime('now', '-30 days')`,
            args: [payload.walletAddress]
        })
        const newSubs = newSubsRes.rows[0].count as number

        const activeSubsRes = await turso.execute({
            sql: 'SELECT COUNT(*) as count FROM subscriptions WHERE creator = ? AND isActive = 1',
            args: [payload.walletAddress]
        })
        const activeSubs = activeSubsRes.rows[0].count as number

        // Engagement: Top performing posts (by unlocks count)
        const postIds = posts.map(p => p.id)
        // We can do this in SQL for better performance, but for now filtering in JS maps
        // Or aggregate purchase group by postId
        const purchaseCounts = unlocks.reduce((acc: any, curr: any) => {
            acc[curr.postId] = (acc[curr.postId] || 0) + 1
            return acc
        }, {}) as Record<string, number>

        const topPosts = posts.sort((a, b) => (purchaseCounts[b.id as string] || 0) - (purchaseCounts[a.id as string] || 0)).slice(0, 5)

        return NextResponse.json({
            overview: {
                totalRevenue: totalUnlocks + totalSubs,
                unlockRevenue: totalUnlocks,
                subscriptionRevenue: totalSubs,
                activeSubscribers: activeSubs,
                newSubscribersLast30Days: newSubs
            },
            topPosts: topPosts.map(p => ({
                id: p.id,
                unlocks: purchaseCounts[p.id as string] || 0,
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
