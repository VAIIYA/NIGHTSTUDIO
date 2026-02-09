import { NextRequest, NextResponse } from 'next/server'
import { connectDb } from '@/lib/db'
import CreatorModel from '@/models/Creator'
import { verifyToken } from '@/lib/auth'
import { uploadToStoracha } from '@/lib/storacha'
import { isRealStorageEnabled } from '@/lib/featureFlags'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDb()
        // Try finding by ID first, then by wallet address
        let creator = null
        if (params.id.length > 24) {
            creator = await CreatorModel.findOne({ walletAddress: params.id })
        } else {
            creator = await CreatorModel.findById(params.id)
        }

        if (!creator && params.id.length <= 44) {
            creator = await CreatorModel.findOne({ walletAddress: params.id })
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
        await connectDb()
        const authHeader = req.headers.get('authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const token = authHeader.split(' ')[1]
        const payload = verifyToken(token)
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

        const walletAddress = payload.walletAddress

        // Find creator - only the owner can update
        const creator = await CreatorModel.findOne({ walletAddress })
        if (!creator) return NextResponse.json({ error: 'Creator profile not found' }, { status: 404 })

        const body = await req.json()
        const { bio, avatarBase64, username, location, hashtags, socialLinks } = body

        // Validations
        if (username && (typeof username !== 'string' || !/^[a-zA-Z0-9_]{3,20}$/.test(username))) {
            return NextResponse.json({ error: 'Username must be 3-20 characters, alphanumeric and underscores only' }, { status: 400 })
        }

        if (username && username !== creator.username) {
            const existing = await CreatorModel.findOne({ username, walletAddress: { $ne: walletAddress } })
            if (existing) return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
            creator.username = username
        }

        if (bio !== undefined) creator.bio = bio
        if (location !== undefined) creator.location = location
        if (socialLinks !== undefined) creator.socialLinks = { ...creator.socialLinks, ...socialLinks }
        if (hashtags !== undefined) {
            creator.hashtags = hashtags.slice(0, 10).map((h: string) => h.startsWith('#') ? h : `#${h}`)
        }

        if (avatarBase64 && avatarBase64.startsWith('data:image/')) {
            if (isRealStorageEnabled()) {
                const buffer = Buffer.from(avatarBase64.split(',')[1], 'base64')
                const avatarCID = await uploadToStoracha(buffer, 'avatar.jpg')
                creator.avatar = avatarCID
            } else {
                // In proto-mode, store the base64 directly so it renders immediately
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
