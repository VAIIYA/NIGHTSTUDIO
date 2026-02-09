import { NextRequest, NextResponse } from 'next/server'
import { turso } from '@/lib/turso'
import { isRealStorageEnabled } from '@/lib/featureFlags'
import { verifyToken } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

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

    // 2. Find Creator
    const creatorRes = await turso.execute({
      sql: 'SELECT * FROM creators WHERE walletAddress = ?',
      args: [payload.walletAddress]
    })

    // If no creator profile, maybe auto-create one or error?
    // For now we error unless we want to auto-create from user
    if (creatorRes.rows.length === 0) {
      // Fallback: Check if user exists, and create a basic creator profile
      const userRes = await turso.execute({ sql: 'SELECT * FROM users WHERE walletAddress = ?', args: [payload.walletAddress] })
      if (userRes.rows.length === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 })

      // Auto-create creator profile
      const newCreatorId = uuidv4()
      await turso.execute({
        sql: 'INSERT INTO creators (id, userId, walletAddress, username) VALUES (?, ?, ?, ?)',
        args: [newCreatorId, userRes.rows[0].id, payload.walletAddress, `User-${payload.walletAddress.slice(0, 6)}`]
      })

      // Refetch
      const retryRes = await turso.execute({
        sql: 'SELECT * FROM creators WHERE walletAddress = ?',
        args: [payload.walletAddress]
      })
      if (retryRes.rows.length === 0) return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
    }

    // Get the fresh creator result (either from first try or after auto-create)
    const creator = (await turso.execute({
      sql: 'SELECT * FROM creators WHERE walletAddress = ?',
      args: [payload.walletAddress]
    })).rows[0]

    // 3. Handle Image Upload if base64 provided
    let finalStorachaCID = storachaCID || ''
    let finalBlurCID = blurCID || ''

    if (imagePreview && (imagePreview.startsWith('data:image/') || imagePreview.startsWith('http'))) {
      finalStorachaCID = imagePreview // Just use the URL for now if it's not a real upload flow
      finalBlurCID = imagePreview
    }

    // 4. Create Post
    const postId = uuidv4()
    await turso.execute({
      sql: `INSERT INTO posts (
            id, creatorId, content, storachaCID, blurCID, priceUSDC, hashtags, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      args: [
        postId,
        creator.id,
        content || '',
        finalStorachaCID,
        finalBlurCID,
        priceUSDC || 0,
        JSON.stringify(hashtags || [])
      ]
    })

    return NextResponse.json({ success: true, postId })
  } catch (e) {
    console.error('Post creation error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
