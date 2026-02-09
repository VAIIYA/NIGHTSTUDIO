import { NextRequest, NextResponse } from 'next/server'
import { connectDb } from '@/lib/db'
import PostModel from '@/models/Post'
import CreatorModel from '@/models/Creator'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDb()

        let creatorId = params.id
        // If it looks like a wallet address (long), find the internal ID
        if (params.id.length > 24) {
            const creator = await CreatorModel.findOne({ walletAddress: params.id })
            if (creator) creatorId = creator._id.toString()
        }

        // Fetch original posts by this creator
        const originalPosts = await PostModel.find({ creatorId }).sort({ createdAt: -1 })

        // Fetch reposts by this creator (using creatorId as the userId interaction check)
        const Interaction = (require('@/models/Interaction').default)
        const reposts = await Interaction.find({ userId: creatorId, type: 'repost' })
        const repostedPostIds = reposts.map((r: any) => r.postId)

        const repostedPosts = await PostModel.find({ _id: { $in: repostedPostIds } })

        // Combine and add a 'isRepost' flag
        const posts = [
            ...originalPosts.map(p => ({ ...p.toObject(), isOriginal: true })),
            ...repostedPosts.map(p => ({ ...p.toObject(), isOriginal: false }))
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        return NextResponse.json({ posts })
    } catch (e) {
        console.error('Creator posts fetch error:', e)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
