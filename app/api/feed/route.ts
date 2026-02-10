import { NextRequest, NextResponse } from 'next/server'
import { turso } from '@/lib/turso'
import { calculateEngagementScore } from '@/lib/engagementScorer'
import { verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url)
        const hashtag = url.searchParams.get('hashtag')
        const sort = url.searchParams.get('sort') || 'newest' // newest, trending, engagement
        const limit = parseInt(url.searchParams.get('limit') || '50')

        const authHeader = req.headers.get('authorization')
        let currentWallet = null
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1]
            const payload = verifyToken(token)
            if (payload) currentWallet = payload.walletAddress
        }

        let query = `
            SELECT 
                p.*,
                c.username, c.avatar, c.walletAddress as creatorWallet, c.hashtags as creatorHashtags,
                (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND type = 'like') as likes,
                (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND type = 'repost') as reposts,
                (SELECT COUNT(*) FROM interactions WHERE postId = p.id AND type = 'comment') as comments
        `

        const args: any[] = []

        if (currentWallet) {
            query += `, (SELECT COUNT(*) FROM purchases pu JOIN users u ON pu.userId = u.id WHERE pu.postId = p.id AND u.walletAddress = ?) as isUnlocked `
            args.push(currentWallet)
        } else {
            query += `, 0 as isUnlocked `
        }

        query += `
            FROM posts p
            LEFT JOIN creators c ON p.creatorId = c.id
        `
        const conditions: string[] = []

        if (hashtag) {
            const normalizedTag = hashtag.startsWith('#') ? hashtag.toLowerCase() : `#${hashtag.toLowerCase()}`
            // Simple LIKE check for JSON array string
            conditions.push(`p.hashtags LIKE ?`)
            args.push(`%${normalizedTag}%`)
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`
        }

        // Sorting
        if (sort === 'engagement') {
            query += ` ORDER BY p.engagementScore DESC`
        } else if (sort === 'trending') {
            // Approximation for now, or join with purchases
            query += ` ORDER BY (likes + reposts * 2 + comments) DESC`
        } else {
            query += ` ORDER BY p.createdAt DESC`
        }

        query += ` LIMIT ?`
        args.push(limit)

        const result = await turso.execute({ sql: query, args })

        const posts = result.rows.map(row => {
            return {
                _id: row.id, // Keep _id for frontend compatibility
                ...row,
                creatorId: {
                    _id: row.creatorId,
                    username: row.username,
                    avatar: row.avatar,
                    walletAddress: row.creatorWallet,
                    hashtags: SafeJSONParse(row.creatorHashtags)
                },
                stats: {
                    likes: row.likes,
                    reposts: row.reposts,
                    comments: row.comments
                },
                hashtags: SafeJSONParse(row.hashtags)
            }
        })

        return NextResponse.json({ posts })

    } catch (e) {
        console.error('Feed error:', e)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

function SafeJSONParse(str: any) {
    try {
        return typeof str === 'string' ? JSON.parse(str) : []
    } catch {
        return []
    }
}
