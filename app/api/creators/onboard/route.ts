import { NextRequest, NextResponse } from 'next/server'
import { connectDb } from '@/lib/db'
import { uploadToStoracha } from '@/lib/storacha'
import { isRealStorageEnabled } from '@/lib/featureFlags'
import { verifyToken } from '@/lib/auth'
import { UserModel, CreatorModel } from '@/models/User'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.split(' ')[1]
    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const walletAddress = payload.walletAddress
    const body = await req.json()
    const { bio, avatarBase64, username, socialLinks, location, hashtags } = body

    await connectDb()

    // Check username uniqueness
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
    if (avatarBase64 && avatarBase64.startsWith('data:image/')) {
      if (isRealStorageEnabled()) {
        const buffer = Buffer.from(avatarBase64.split(',')[1], 'base64')
        avatarCID = await uploadToStoracha(buffer, 'avatar.jpg')
      } else {
        avatarCID = avatarBase64
      }
    }

    const normalizedHashtags = hashtags ? hashtags.slice(0, 10).map((h: string) => h.startsWith('#') ? h : `#${h}`) : []

    if (creator) {
      creator.bio = bio || creator.bio
      creator.avatar = avatarCID
      creator.username = username || creator.username
      creator.socialLinks = { ...creator.socialLinks, ...socialLinks }
      creator.location = location || creator.location
      creator.hashtags = normalizedHashtags
      await creator.save()
    } else {
      creator = new CreatorModel({
        userId: user._id,
        walletAddress,
        username: username || `User-${walletAddress.slice(0, 6)}`,
        bio,
        avatar: avatarCID,
        socialLinks: socialLinks || {},
        location,
        hashtags: normalizedHashtags
      })
      await creator.save()
    }

    return NextResponse.json({ success: true, creatorId: creator._id })
  } catch (e) {
    console.error('Onboard error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
