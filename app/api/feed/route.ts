import { NextRequest, NextResponse } from 'next/server'
import { connectDb } from '@/lib/db'
import PostModel from '@/models/Post'
import InteractionModel from '@/models/Interaction'
import PurchaseModel from '@/models/Purchase'
import { calculateEngagementScore } from '@/lib/engagementScorer'

export async function GET(req: NextRequest) {
    try {
        await connectDb()

        const url = new URL(req.url)
        const hashtag = url.searchParams.get('hashtag')
        const sort = url.searchParams.get('sort') || 'newest' // newest, trending, engagement
        const limit = parseInt(url.searchParams.get('limit') || '50')

        // Build query
        const query: any = {}
        if (hashtag) {
            const normalizedTag = hashtag.startsWith('#') ? hashtag.toLowerCase() : `#${hashtag.toLowerCase()}`
            query.hashtags = normalizedTag
        }

        // Fetch posts
        let posts = await PostModel.find(query)
            .populate('creatorId', 'username bio avatar walletAddress hashtags')
            .limit(Math.min(limit, 100)) // Cap at 100

        // Aggregate interactions for these posts
        const postIds = posts.map(p => p._id.toString())

        const interactions = await InteractionModel.aggregate([
            { $match: { postId: { $in: postIds } } },
            {
                $group: {
                    _id: '$postId',
                    likes: { $sum: { $cond: [{ $eq: ['$type', 'like'] }, 1, 0] } },
                    comments: { $sum: { $cond: [{ $eq: ['$type', 'comment'] }, 1, 0] } },
                    reposts: { $sum: { $cond: [{ $eq: ['$type', 'repost'] }, 1, 0] } },
                }
            }
        ])

        const interactionMap = interactions.reduce((acc, curr) => {
            acc[curr._id] = curr
            return acc
        }, {} as any)

        // Enhance posts with stats
        const enhancedPosts = posts.map(post => {
            const stats = interactionMap[post._id.toString()] || { likes: 0, comments: 0, reposts: 0 }
            return {
                ...post.toObject(),
                stats
            }
        })

        // Sort based on mode
        if (sort === 'engagement') {
            // Calculate engagement scores on-the-fly
            const postsWithScores = await Promise.all(
                enhancedPosts.map(async (post) => {
                    const score = await calculateEngagementScore(post._id.toString(), post.createdAt)
                    return { ...post, calculatedScore: score }
                })
            )
            postsWithScores.sort((a, b) => b.calculatedScore - a.calculatedScore)

            // Apply diversity filter: limit posts per creator
            const diversePosts = applyDiversityFilter(postsWithScores, 3)
            return NextResponse.json({ posts: diversePosts.slice(0, limit) })

        } else if (sort === 'trending') {
            // Get purchase counts for trending
            const purchaseCounts = await PurchaseModel.aggregate([
                { $match: { postId: { $in: postIds } } },
                { $group: { _id: '$postId', count: { $sum: 1 } } }
            ])
            const countMap = purchaseCounts.reduce((acc, pc) => {
                acc[pc._id] = pc.count
                return acc
            }, {} as Record<string, number>)

            enhancedPosts.sort((a, b) => (countMap[b._id] || 0) - (countMap[a._id] || 0))

            const diversePosts = applyDiversityFilter(enhancedPosts, 3)
            return NextResponse.json({ posts: diversePosts.slice(0, limit) })

        } else {
            // Default: newest
            enhancedPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            return NextResponse.json({ posts: enhancedPosts.slice(0, limit) })
        }

    } catch (e) {
        console.error('Feed error:', e)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * Apply diversity filter to prevent one creator from dominating the feed
 * Limits the number of consecutive posts from the same creator
 */
function applyDiversityFilter(posts: any[], maxConsecutive: number): any[] {
    const result: any[] = []
    const creatorCounts = new Map<string, number>()

    for (const post of posts) {
        const creatorId = post.creatorId?._id?.toString() || post.creatorId?.toString()
        const count = creatorCounts.get(creatorId) || 0

        if (count < maxConsecutive) {
            result.push(post)
            creatorCounts.set(creatorId, count + 1)
        }
    }

    return result
}
