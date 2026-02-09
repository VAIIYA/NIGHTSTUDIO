import { NextRequest, NextResponse } from 'next/server'
import { connectDb } from '@/lib/db'
import PostModel from '@/models/Post'
import CreatorModel from '@/models/Creator'
import { isRealStorageEnabled } from '@/lib/featureFlags'
import { verifyToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    await connectDb()

    // 1. Auth Check
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.split(' ')[1]
    const payload = verifyToken(token)
    if (!payload || !payload.walletAddress) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { content, storachaCID, blurCID, priceUSDC, hashtags, imagePreview } = await req.json()

    // 2. Find Creator
    const creator = await CreatorModel.findOne({ walletAddress: payload.walletAddress })
    if (!creator) {
      return NextResponse.json({ error: 'Creator profile not found' }, { status: 404 })
    }

    // 3. Handle Image Upload if base64 provided
    let finalStorachaCID = storachaCID || ''
    let finalBlurCID = blurCID || ''

    if (imagePreview && imagePreview.startsWith('data:image/')) {
      if (isRealStorageEnabled()) {
        const buffer = Buffer.from(imagePreview.split(',')[1], 'base64')
        const uploadToStoracha = (require('@/lib/storacha').uploadToStoracha)
        finalStorachaCID = await uploadToStoracha(buffer, 'post_image.jpg')
        // For prototype, we'll use the same CID for blur or a generic blurred CID if we had a processor
        // In a real app, we'd process the image to blur it here.
        finalBlurCID = finalStorachaCID
      } else {
        finalStorachaCID = 'proto-mock-post-image-' + Date.now()
        finalBlurCID = finalStorachaCID
      }
    }

    // 4. Create Post
    const post = new PostModel({
      creatorId: creator._id,
      content: content || '',
      storachaCID: finalStorachaCID,
      blurCID: finalBlurCID,
      priceUSDC: priceUSDC || 0,
      hashtags: hashtags || [],
      createdAt: new Date(),
      unlockedUsers: [],
    })

    await post.save()
    return NextResponse.json({ success: true, postId: post._id, post })
  } catch (e) {
    console.error('Post creation error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
