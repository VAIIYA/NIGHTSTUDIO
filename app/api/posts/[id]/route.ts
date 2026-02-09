import { NextRequest, NextResponse } from 'next/server'
import { turso } from '@/lib/turso'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = params.id

        const result = await turso.execute({
            sql: `
                SELECT p.*, 
                       c.username, c.avatar, c.walletAddress as creatorWallet, c.bio, c.location, c.socialLinks
                FROM posts p
                LEFT JOIN creators c ON p.creatorId = c.id
                WHERE p.id = ?
            `,
            args: [id]
        })

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }

        const row = result.rows[0]

        // Parse JSON
        try { if (typeof row.hashtags === 'string') row.hashtags = JSON.parse(row.hashtags) } catch { }
        try { if (typeof row.socialLinks === 'string') row.socialLinks = JSON.parse(row.socialLinks) } catch { }

        // Construct response object matching expected format (similar to what Mongoose populate did)
        const post = {
            ...row,
            creatorId: { // Mimic populated creator
                _id: row.creatorId,
                id: row.creatorId,
                username: row.username,
                avatar: row.avatar,
                walletAddress: row.creatorWallet,
                bio: row.bio,
                location: row.location,
                socialLinks: row.socialLinks
            }
        }

        return NextResponse.json(post)
    } catch (error) {
        console.error('Fetch post error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
