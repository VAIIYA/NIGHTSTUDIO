import { NextRequest, NextResponse } from 'next/server'
import { connectDb } from '@/lib/db'
import { PostModel } from '@/models/Post'
import { verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url)
        const hashtag = url.searchParams.get('hashtag')
        const sort = url.searchParams.get('sort') || 'newest'
        const limit = parseInt(url.searchParams.get('limit') || '50')

        const authHeader = req.headers.get('authorization')
        let currentWallet = null
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1]
            const payload = verifyToken(token)
            if (payload) currentWallet = payload.walletAddress
        }

        await connectDb()

        const filter: any = {}
        if (hashtag) {
            const normalizedTag = hashtag.startsWith('#') ? hashtag.toLowerCase() : `#${hashtag.toLowerCase()}`
            filter.hashtags = normalizedTag
        }

        let query = PostModel.find(filter).populate('creatorId').limit(limit)

        if (sort === 'engagement') {
            query = query.sort({ engagementScore: -1 })
        } else if (sort === 'trending') {
            // Sort by sum of stats
            query = query.sort({ 'stats.likes': -1, 'stats.reposts': -1 })
        } else {
            query = query.sort({ createdAt: -1 })
        }

        const rawPosts = await query.lean()

        const posts = rawPosts.map((p: any) => ({
            ...p,
            _id: p._id.toString(),
            isUnlocked: currentWallet ? (p.unlockedUsers || []).includes(currentWallet) : false
        }))

        return NextResponse.json({ posts })

    } catch (e) {
        console.error('Feed error:', e)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
