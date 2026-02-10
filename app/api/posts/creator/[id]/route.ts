import { NextRequest, NextResponse } from 'next/server'
import { connectDb } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { PostModel, InteractionModel } from '@/models/Post'
import { CreatorModel } from '@/models/User'
import mongoose from 'mongoose'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDb()
        const authHeader = req.headers.get('authorization')
        let currentWallet = null
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1]
            const payload = verifyToken(token)
            if (payload) currentWallet = payload.walletAddress
        }

        let creatorId = params.id
        // If it's a wallet address, find the creator
        if (!mongoose.Types.ObjectId.isValid(creatorId)) {
            const creator = await CreatorModel.findOne({ walletAddress: params.id }).lean()
            if (creator) creatorId = (creator as any)._id.toString()
            else return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
        }

        // Fetch original posts by this creator
        const originalPosts = await PostModel.find({ creatorId })
            .populate('creatorId')
            .sort({ createdAt: -1 })
            .lean()

        // Fetch reposts
        // First find interaction of type 'repost' by this creator
        // But wait, the original logic used creatorId AS userId for interactions.
        // Let's find the user associated with this creatorId
        const creator = await CreatorModel.findById(creatorId).lean()
        if (!creator) return NextResponse.json({ error: 'Creator not found' }, { status: 404 })

        const userId = (creator as any).userId

        const reposts = await InteractionModel.find({ userId, type: 'repost' }).lean()
        const repostedPostIds = reposts.map(r => r.postId)

        const repostedPosts = await PostModel.find({ _id: { $in: repostedPostIds } })
            .populate('creatorId')
            .lean()

        const formatPost = (p: any, isOriginal: boolean) => {
            const isUnlocked = currentWallet ? p.unlockedUsers?.includes(currentWallet) : false
            return {
                ...p,
                isOriginal,
                isUnlocked: isUnlocked ? 1 : 0 // Keep 1/0 for frontend consistency
            }
        }

        const posts = [
            ...originalPosts.map(p => formatPost(p, true)),
            ...repostedPosts.map(p => formatPost(p, false))
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        return NextResponse.json({ posts })
    } catch (e) {
        console.error('Creator posts fetch error:', e)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
