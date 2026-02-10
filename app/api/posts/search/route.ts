import { NextRequest, NextResponse } from 'next/server'
import { connectDb } from '@/lib/db'
import { PostModel } from '@/models/Post'
import { CreatorModel } from '@/models/User'

export async function GET(req: NextRequest) {
  try {
    await connectDb()
    const url = new URL(req.url)
    const query = url.searchParams.get('q') || ''
    const priceMin = parseFloat(url.searchParams.get('priceMin') || '0')
    const priceMax = parseFloat(url.searchParams.get('priceMax') || '1000')
    const sort = url.searchParams.get('sort') || 'newest' // newest, trending
    const location = url.searchParams.get('location')
    const hashtag = url.searchParams.get('hashtag')

    let filter: any = {
      priceUSDC: { $gte: priceMin, $lte: priceMax }
    }

    if (hashtag) {
      const tag = hashtag.startsWith('#') ? hashtag : `#${hashtag}`
      filter.hashtags = tag
    }

    let creatorFilter: any = {}
    if (query) {
      creatorFilter.$or = [
        { username: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } }
      ]
    }
    if (location) {
      creatorFilter.location = { $regex: location, $options: 'i' }
    }

    // Since we need to join/populate and filter on creator, we might need to find creators first
    let creatorIds: any[] = []
    if (Object.keys(creatorFilter).length > 0) {
      const creators = await CreatorModel.find(creatorFilter).select('_id')
      creatorIds = creators.map(c => c._id)
      filter.creatorId = { $in: creatorIds }
    }

    let postsQuery = PostModel.find(filter).populate('creatorId')

    if (sort === 'trending') {
      postsQuery = postsQuery.sort({ engagementScore: -1 })
    } else {
      postsQuery = postsQuery.sort({ createdAt: -1 })
    }

    const posts = await postsQuery.limit(50).lean()

    return NextResponse.json({ posts })
  } catch (e) {
    console.error('Search error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
