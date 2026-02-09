import { NextRequest, NextResponse } from 'next/server'
import { connectDb } from '@/lib/db'
import PostModel from '@/models/Post'
import CreatorModel from '@/models/Creator'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDb()
        const id = params.id
        const post = await PostModel.findById(id).populate('creatorId')
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }
        return NextResponse.json(post)
    } catch (error) {
        console.error('Fetch post error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
