import { NextRequest, NextResponse } from 'next/server'
import { connectDb } from '@/lib/db'
import InteractionModel from '@/models/Interaction'
import { verifyToken } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDb()
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
        const userId = payload.walletAddress // Using wallet as ID consistent with other routes

        if (type === 'like' || type === 'repost') {
            // Toggle logic for like/repost
            const existing = await InteractionModel.findOne({ userId, postId, type })
            if (existing) {
                await InteractionModel.deleteOne({ _id: existing._id })
                return NextResponse.json({ success: true, action: 'removed' })
            }
        }

        const interaction = new InteractionModel({
            userId,
            postId,
            type,
            content: type === 'comment' ? content : undefined
        })
        await interaction.save()

        return NextResponse.json({ success: true, action: 'added' })
    } catch (e: any) {
        if (e.code === 11000) return NextResponse.json({ success: true, action: 'exists' }) // Race condition handle
        console.error('Interact error:', e)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
