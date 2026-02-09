import { NextRequest, NextResponse } from 'next/server'
import { turso } from '@/lib/turso'
import { v4 as uuidv4 } from 'uuid'
import { verifyToken } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const authHeader = req.headers.get('authorization')
        if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const token = authHeader.split(' ')[1]
        const payload = verifyToken(token)
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

        const body = await req.json()
        const { type, content } = body

        if (!['like', 'comment', 'repost'].includes(type)) {
            return NextResponse.json({ error: 'Invalid interaction type' }, { status: 400 })
        }

        if (type === 'comment' && !content) {
            return NextResponse.json({ error: 'Comment content is required' }, { status: 400 })
        }

        const postId = params.id
        const userRes = await turso.execute({
            sql: 'SELECT id FROM users WHERE walletAddress = ?',
            args: [payload.walletAddress]
        })

        if (userRes.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const userId = userRes.rows[0].id as string

        if (type === 'like' || type === 'repost') {
            // Check existing
            const existing = await turso.execute({
                sql: 'SELECT id FROM interactions WHERE userId = ? AND postId = ? AND type = ?',
                args: [userId, postId, type]
            })

            if (existing.rows.length > 0) {
                await turso.execute({
                    sql: 'DELETE FROM interactions WHERE id = ?',
                    args: [existing.rows[0].id]
                })
                return NextResponse.json({ success: true, action: 'removed' })
            }
        }

        const interactionId = uuidv4()
        await turso.execute({
            sql: 'INSERT INTO interactions (id, postId, userId, type, content) VALUES (?, ?, ?, ?, ?)',
            args: [interactionId, postId, userId, type, type === 'comment' ? content : null]
        })

        return NextResponse.json({ success: true, action: 'added' })
    } catch (e: any) {
        console.error('Interact error:', e)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
