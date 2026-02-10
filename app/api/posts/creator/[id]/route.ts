import { NextRequest, NextResponse } from 'next/server'
import { turso } from '@/lib/turso'
import { verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const authHeader = req.headers.get('authorization')
        let currentWallet = null
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1]
            const payload = verifyToken(token)
            if (payload) currentWallet = payload.walletAddress
        }

        let creatorId = params.id
        // If it looks like a wallet address (long), find the internal ID
        if (params.id.length > 24) {
            const creatorRes = await turso.execute({
                sql: 'SELECT id FROM creators WHERE walletAddress = ?',
                args: [params.id]
            })
            if (creatorRes.rows.length > 0) creatorId = creatorRes.rows[0].id as string
        }

        const isUnlockedSubquery = currentWallet
            ? `, (SELECT COUNT(*) FROM purchases pu JOIN users u ON pu.userId = u.id WHERE pu.postId = p.id AND u.walletAddress = ?) as isUnlocked `
            : `, 0 as isUnlocked `
        const subqueryArgs = currentWallet ? [currentWallet] : []

        // Fetch original posts by this creator
        const originalPostsRes = await turso.execute({
            sql: `
                SELECT p.*, 
                       c.username, c.avatar, c.walletAddress as creatorWallet
                       ${isUnlockedSubquery}
                FROM posts p
                LEFT JOIN creators c ON p.creatorId = c.id
                WHERE p.creatorId = ?
                ORDER BY p.createdAt DESC
            `,
            args: [...subqueryArgs, creatorId]
        })

        // Fetch reposts
        const repostsRes = await turso.execute({
            sql: 'SELECT postId FROM interactions WHERE userId = ? AND type = ?',
            args: [creatorId, 'repost']
        })
        const repostedPostIds = repostsRes.rows.map(r => r.postId)

        let repostedPosts: any[] = []
        if (repostedPostIds.length > 0) {
            const placeholders = repostedPostIds.map(() => '?').join(',')
            const repostedPostsRes = await turso.execute({
                sql: `
                    SELECT p.*, 
                           c.username, c.avatar, c.walletAddress as creatorWallet
                           ${isUnlockedSubquery}
                    FROM posts p
                    LEFT JOIN creators c ON p.creatorId = c.id
                    WHERE p.id IN (${placeholders})
                 `,
                args: [...subqueryArgs, ...repostedPostIds]
            })
            repostedPosts = repostedPostsRes.rows
        }

        const formatPost = (p: any, isOriginal: boolean) => {
            try { if (typeof p.hashtags === 'string') p.hashtags = JSON.parse(p.hashtags as string) } catch { }
            return {
                ...p,
                _id: p.id,
                isOriginal,
                creatorId: { // Mimic populated
                    _id: p.creatorId,
                    id: p.creatorId, // Turso ID
                    username: p.username,
                    avatar: p.avatar,
                    walletAddress: p.creatorWallet
                }
            }
        }

        // Combine and add a 'isRepost' flag
        const posts = [
            ...originalPostsRes.rows.map(p => formatPost(p, true)),
            ...repostedPosts.map(p => formatPost(p, false))
        ].sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime())

        return NextResponse.json({ posts })
    } catch (e) {
        console.error('Creator posts fetch error:', e)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
