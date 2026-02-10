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
        if (!payload) {
            console.error('Token verification failed for token:', token.substring(0, 10) + '...')
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        console.log('Verifying user for wallet:', payload.walletAddress)

        const userResult = await turso.execute({
            sql: 'SELECT * FROM users WHERE walletAddress = ?',
            args: [payload.walletAddress]
        })

        if (userResult.rows.length === 0) {
            console.warn('User not found in database:', payload.walletAddress)
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const userRow = userResult.rows[0] as any
        const user = { ...userRow, _id: userRow.id }

        const creatorResult = await turso.execute({
            sql: 'SELECT * FROM creators WHERE userId = ?',
            args: [user.id]
        })

        let creator = null
        if (creatorResult.rows.length > 0) {
            const creatorRow = creatorResult.rows[0] as any
            creator = { ...creatorRow, _id: creatorRow.id } as any
            // Parse JSON fields if necessary
            if (creator.socialLinks && typeof creator.socialLinks === 'string') {
                try { creator.socialLinks = JSON.parse(creator.socialLinks) } catch { }
            }
            if (creator.hashtags && typeof creator.hashtags === 'string') {
                try { creator.hashtags = JSON.parse(creator.hashtags) } catch { }
            }
        }

        return NextResponse.json({ user, creator })
    } catch (e: any) {
        console.error('Auth me error details:', e.message, e.stack)
        return NextResponse.json({ error: 'Internal server error', details: e.message }, { status: 500 })
    }
}
