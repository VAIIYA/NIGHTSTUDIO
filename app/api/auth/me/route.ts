import { NextRequest, NextResponse } from 'next/server'
import { turso } from '@/lib/turso'
import { verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const token = authHeader.split(' ')[1]
        const payload = verifyToken(token)
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

        const userResult = await turso.execute({
            sql: 'SELECT * FROM users WHERE walletAddress = ?',
            args: [payload.walletAddress]
        })

        if (userResult.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const user = userResult.rows[0]
        const creatorResult = await turso.execute({
            sql: 'SELECT * FROM creators WHERE userId = ?',
            args: [user.id]
        })

        let creator = null
        if (creatorResult.rows.length > 0) {
            creator = creatorResult.rows[0]
            // Parse JSON fields if necessary
            if (creator.socialLinks && typeof creator.socialLinks === 'string') {
                try { creator.socialLinks = JSON.parse(creator.socialLinks as string) } catch { }
            }
            if (creator.hashtags && typeof creator.hashtags === 'string') {
                try { creator.hashtags = JSON.parse(creator.hashtags as string) } catch { }
            }
        }

        return NextResponse.json({ user, creator })
    } catch (e) {
        console.error('Auth me error:', e)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
