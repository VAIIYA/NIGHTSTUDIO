import { NextRequest, NextResponse } from 'next/server'
import { turso } from '@/lib/turso'
import { uploadToStoracha } from '@/lib/storacha'
import { isRealStorageEnabled } from '@/lib/featureFlags'
import { verifyToken } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

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
      const existing = await turso.execute({
        sql: 'SELECT id FROM creators WHERE username = ? AND walletAddress != ?',
        args: [username, walletAddress]
      })
      if (existing.rows.length > 0) return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
    }

    // Find or create user
    let userResult = await turso.execute({
      sql: 'SELECT * FROM users WHERE walletAddress = ?',
      args: [walletAddress]
    })

    let userId = ''
    if (userResult.rows.length === 0) {
      userId = uuidv4()
      await turso.execute({
        sql: 'INSERT INTO users (id, walletAddress, role) VALUES (?, ?, ?)',
        args: [userId, walletAddress, 'creator']
      })
    } else {
      userId = userResult.rows[0].id as string
      // Update role to creator
      await turso.execute({
        sql: 'UPDATE users SET role = ? WHERE id = ?',
        args: ['creator', userId]
      })
    }

    // Create or update creator profile
    const creatorRes = await turso.execute({
      sql: 'SELECT * FROM creators WHERE userId = ?',
      args: [userId]
    })

    let creator = creatorRes.rows.length > 0 ? creatorRes.rows[0] : null
    let avatarCID = (creator?.avatar as string) || ''

    if (avatarBase64 && isRealStorageEnabled()) {
      const buffer = Buffer.from(avatarBase64.split(',')[1], 'base64')
      avatarCID = await uploadToStoracha(buffer, 'avatar.jpg')
    }
    if (!isRealStorageEnabled() && avatarBase64) {
      // Mock or use base64 direct
      avatarCID = avatarBase64 || 'QmMockAvatarCID'
    }

    const normalizedHashtags = hashtags ? hashtags.slice(0, 10).map((h: string) => h.startsWith('#') ? h : `#${h}`) : []
    const socialLinksJSON = JSON.stringify(socialLinks || {})
    const hashtagsJSON = JSON.stringify(normalizedHashtags)

    if (creator) {
      // Update
      await turso.execute({
        sql: `UPDATE creators SET 
                bio = COALESCE(?, bio), 
                avatar = ?, 
                username = COALESCE(?, username), 
                socialLinks = ?, 
                location = COALESCE(?, location), 
                hashtags = ? 
                WHERE id = ?`,
        args: [
          bio || null,
          avatarCID,
          username || null,
          socialLinksJSON,
          location || null,
          hashtagsJSON,
          creator.id
        ]
      })
      return NextResponse.json({ success: true, creatorId: creator.id })
    } else {
      // Create
      const newCreatorId = uuidv4()
      await turso.execute({
        sql: `INSERT INTO creators (
              id, userId, walletAddress, username, bio, avatar, socialLinks, location, hashtags
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          newCreatorId,
          userId,
          walletAddress,
          username || `User-${walletAddress.slice(0, 6)}`,
          bio || null,
          avatarCID,
          socialLinksJSON,
          location || null,
          hashtagsJSON
        ]
      })
      return NextResponse.json({ success: true, creatorId: newCreatorId })
    }

  } catch (e) {
    console.error('Onboard error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
