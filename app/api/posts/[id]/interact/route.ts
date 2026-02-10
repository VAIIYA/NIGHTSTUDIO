import { NextRequest, NextResponse } from 'next/server'
import { connectDb } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { InteractionModel, PostModel } from '@/models/Post'
import { UserModel } from '@/models/User'

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
        const user = await UserModel.findOne({ walletAddress: payload.walletAddress })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        if (type === 'like' || type === 'repost') {
            const existing = await InteractionModel.findOne({ userId: user._id, postId, type })

            if (existing) {
                await InteractionModel.deleteOne({ _id: existing._id })
                // Update stats
                const inc = type === 'like' ? { 'stats.likes': -1 } : { 'stats.reposts': -1 }
                await PostModel.findByIdAndUpdate(postId, { $inc: inc })
                return NextResponse.json({ success: true, action: 'removed' })
            }
        }

        const interaction = new InteractionModel({
            postId,
            userId: user._id,
            type,
            content: type === 'comment' ? content : undefined
        })

        await interaction.save()

        // Update stats
        const inc = type === 'like' ? { 'stats.likes': 1 } : type === 'repost' ? { 'stats.reposts': 1 } : { 'stats.comments': 1 }
        await PostModel.findByIdAndUpdate(postId, { $inc: inc })

        return NextResponse.json({ success: true, action: 'added' })
    } catch (e: any) {
        console.error('Interact error:', e)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
