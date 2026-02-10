import { NextRequest, NextResponse } from 'next/server'
import { connectDb } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { uploadToStoracha } from '@/lib/storacha'
import { isRealStorageEnabled } from '@/lib/featureFlags'
import { CreatorModel } from '@/models/User'
import mongoose from 'mongoose'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDb()
        let creator;
        if (mongoose.Types.ObjectId.isValid(params.id)) {
            creator = await CreatorModel.findById(params.id).lean();
        }

        if (!creator) {
            creator = await CreatorModel.findOne({ walletAddress: params.id }).lean();
        }

        if (!creator) return NextResponse.json({ error: 'Creator not found' }, { status: 404 })

        return NextResponse.json({ creator })
    } catch (e) {
        console.error('Creator fetch error:', e)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const authHeader = req.headers.get('authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const token = authHeader.split(' ')[1]
        const payload = verifyToken(token)
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

        await connectDb()
        const walletAddress = payload.walletAddress

        const creator = await CreatorModel.findOne({ walletAddress })
        if (!creator) return NextResponse.json({ error: 'Creator profile not found' }, { status: 404 })

        const body = await req.json()
        const { bio, avatarBase64, username, location, hashtags, socialLinks } = body

        if (username && (typeof username !== 'string' || !/^[a-zA-Z0-9_]{3,20}$/.test(username))) {
            return NextResponse.json({ error: 'Username must be 3-20 characters' }, { status: 400 })
        }

        if (username && username !== creator.username) {
            const existing = await CreatorModel.findOne({ username, walletAddress: { $ne: walletAddress } })
            if (existing) return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
        }

        if (username !== undefined) creator.username = username
        if (bio !== undefined) creator.bio = bio
        if (location !== undefined) creator.location = location
        if (socialLinks !== undefined) creator.socialLinks = { ...creator.socialLinks, ...socialLinks }
        if (hashtags !== undefined) creator.hashtags = hashtags.slice(0, 10).map((h: string) => h.startsWith('#') ? h : `#${h}`)

        if (avatarBase64 && avatarBase64.startsWith('data:image/')) {
            if (isRealStorageEnabled()) {
                const buffer = Buffer.from(avatarBase64.split(',')[1], 'base64')
                creator.avatar = await uploadToStoracha(buffer, 'avatar.jpg')
            } else {
                creator.avatar = avatarBase64
            }
        }

        await creator.save()
        return NextResponse.json({ success: true, creator })
    } catch (e) {
        console.error('Creator update error:', e)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
