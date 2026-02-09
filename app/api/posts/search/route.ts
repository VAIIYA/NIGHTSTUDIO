import { NextRequest, NextResponse } from 'next/server'
import { turso } from '@/lib/turso'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const query = url.searchParams.get('q') || ''
    const priceMin = parseFloat(url.searchParams.get('priceMin') || '0')
    const priceMax = parseFloat(url.searchParams.get('priceMax') || '1000')
    const sort = url.searchParams.get('sort') || 'newest' // newest, trending
    const location = url.searchParams.get('location')
    const hashtag = url.searchParams.get('hashtag')

    let sql = `
        SELECT p.*, 
               c.username, c.bio, c.avatar, c.location, c.hashtags as creatorHashtags, c.walletAddress as creatorWallet,
               (SELECT COUNT(*) FROM purchases WHERE postId = p.id) as purchaseCount
        FROM posts p
        JOIN creators c ON p.creatorId = c.id
        WHERE p.priceUSDC >= ? AND p.priceUSDC <= ?
      `
    const args: any[] = [priceMin, priceMax]

    if (query) {
      sql += ` AND (c.username LIKE ? OR c.bio LIKE ?)`
      args.push(`%${query}%`, `%${query}%`)
    }

    if (location) {
      sql += ` AND c.location LIKE ?`
      args.push(`%${location}%`)
    }

    if (hashtag) {
      const tag = hashtag.startsWith('#') ? hashtag : `#${hashtag}`
      // Simple string matching for JSON arrays stored as text is tricky but standard LIKE works for simple cases
      // or using JSON functions if enabled in libSQL
      sql += ` AND (p.hashtags LIKE ? OR c.hashtags LIKE ?)`
      args.push(`%${tag}%`, `%${tag}%`)
    }

    if (sort === 'trending') {
      sql += ` ORDER BY purchaseCount DESC`
    } else {
      sql += ` ORDER BY p.createdAt DESC`
    }

    sql += ` LIMIT 50`

    const result = await turso.execute({ sql, args })

    const posts = result.rows.map(row => {
      // Parse JSON
      try { if (typeof row.hashtags === 'string') row.hashtags = JSON.parse(row.hashtags) } catch { }
      try { if (typeof row.creatorHashtags === 'string') row.creatorHashtags = JSON.parse(row.creatorHashtags) } catch { }

      return {
        ...row,
        creatorId: { // Mimic populated creator
          _id: row.creatorId,
          id: row.creatorId,
          username: row.username,
          bio: row.bio,
          avatar: row.avatar,
          location: row.location,
          hashtags: row.creatorHashtags,
          walletAddress: row.creatorWallet
        }
      }
    })

    return NextResponse.json({ posts })
  } catch (e) {
    console.error('Search error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
