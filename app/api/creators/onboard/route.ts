import { NextRequest, NextResponse } from 'next/server'
import { connectDb } from '@/lib/db'
import UserModel from '@/models/User'
import CreatorModel from '@/models/Creator'
import { uploadToStoracha } from '@/lib/storacha'
import { isRealStorageEnabled } from '@/lib/featureFlags'
import { verifyToken, JWTPayload } from '@/lib/auth'
import jwt from 'jsonwebtoken'

export async function POST(req: NextRequest) {
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
    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
    }

    const body = await req.json()
    const { bio, avatarBase64, username, socialLinks, location, hashtags } = body

    if (bio && typeof bio !== 'string') return NextResponse.json({ error: 'Invalid bio' }, { status: 400 })
    if (username && (typeof username !== 'string' || !/^[a-zA-Z0-9_]{3,20}$/.test(username))) {
      return NextResponse.json({ error: 'Username must be 3-20 characters, alphanumeric and underscores only' }, { status: 400 })
    }
    if (avatarBase64 && (typeof avatarBase64 !== 'string' || !avatarBase64.startsWith('data:image/'))) {
      return NextResponse.json({ error: 'Invalid avatar' }, { status: 400 })
    }

    // Check username uniqueness if provided
    if (username) {
      const existing = await CreatorModel.findOne({ username, walletAddress: { $ne: walletAddress } })
      if (existing) return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
    }

    // Find or create user
    let user = await UserModel.findOne({ walletAddress })
    if (!user) {
      user = new UserModel({ walletAddress, role: 'creator' })
      await user.save()
    } else {
      user.role = 'creator'
      await user.save()
    }

    // Create or update creator profile
    let creator = await CreatorModel.findOne({ userId: user._id })
    let avatarCID = creator?.avatar || ''
    if (avatarBase64 && isRealStorageEnabled()) {
      const buffer = Buffer.from(avatarBase64.split(',')[1], 'base64')
      avatarCID = await uploadToStoracha(buffer, 'avatar.jpg')
    }
    if (!isRealStorageEnabled()) {
      avatarCID = avatarCID || 'QmMockAvatarCID'
    }
    if (creator) {
      creator.bio = bio || creator.bio
      creator.avatar = avatarCID || creator.avatar
      creator.username = username || creator.username
      creator.socialLinks = socialLinks || creator.socialLinks
      creator.location = location || creator.location
      creator.hashtags = hashtags ? hashtags.slice(0, 10).map((h: string) => h.startsWith('#') ? h : `#${h}`) : creator.hashtags
      await creator.save()
    } else {
      creator = new CreatorModel({
        userId: user._id,
        walletAddress,
        bio,
        username,
        avatar: avatarCID,
        socialLinks,
        location,
        hashtags: hashtags ? hashtags.slice(0, 10).map((h: string) => h.startsWith('#') ? h : `#${h}`) : []
      })
      await creator.save()
    }

    return NextResponse.json({ success: true, creatorId: creator._id })
  } catch (e) {
    console.error('Onboard error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
