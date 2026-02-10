import { NextRequest, NextResponse } from 'next/server'
import { connectDb } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { CreatorModel, UserModel } from '@/models/User'
import { PostModel } from '@/models/Post'

export async function POST(req: NextRequest) {
  try {
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

    await connectDb()

    // 2. Find Creator
    let creator = await CreatorModel.findOne({ walletAddress: payload.walletAddress })

    if (!creator) {
      // Fallback: Check if user exists, and create a basic creator profile
      const user = await UserModel.findOne({ walletAddress: payload.walletAddress })
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

      // Auto-create creator profile
      creator = new CreatorModel({
        userId: user._id,
        walletAddress: payload.walletAddress,
        username: `User-${payload.walletAddress.slice(0, 6)}`
      })
      await creator.save()
    }

    // 3. Handle Image Upload (simplified for now)
    let finalStorachaCID = storachaCID || ''
    let finalBlurCID = blurCID || ''

    if (imagePreview && (imagePreview.startsWith('data:image/') || imagePreview.startsWith('http'))) {
      finalStorachaCID = imagePreview
      finalBlurCID = imagePreview
    }

    // 4. Create Post
    const post = new PostModel({
      creatorId: creator._id,
      content: content || '',
      storachaCID: finalStorachaCID,
      blurCID: finalBlurCID,
      priceUSDC: priceUSDC || 0,
      hashtags: hashtags || []
    })

    await post.save()

    return NextResponse.json({ success: true, postId: post._id })
  } catch (e) {
    console.error('Post creation error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
