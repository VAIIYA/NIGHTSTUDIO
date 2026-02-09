import { NextRequest, NextResponse } from 'next/server'
import { connectDb } from '@/lib/db'
import PostModel from '@/models/Post'
import CreatorModel from '@/models/Creator'
import PurchaseModel from '@/models/Purchase'

export async function GET(req: NextRequest) {
  await connectDb()
  const url = new URL(req.url)
  const query = url.searchParams.get('q') || ''
  const priceMin = parseFloat(url.searchParams.get('priceMin') || '0')
  const priceMax = parseFloat(url.searchParams.get('priceMax') || '1000')
  const sort = url.searchParams.get('sort') || 'newest' // newest, trending
  const location = url.searchParams.get('location')
  const hashtag = url.searchParams.get('hashtag')

  let posts = await PostModel.find({
    priceUSDC: { $gte: priceMin, $lte: priceMax },
  }).populate('creatorId', 'bio avatar username location hashtags walletAddress')

  // Filter logic
  if (query || location || hashtag) {
    const creatorQuery: any = { $or: [] }

    if (query) {
      creatorQuery.$or.push({ bio: { $regex: query, $options: 'i' } })
      creatorQuery.$or.push({ username: { $regex: query, $options: 'i' } })
    }

    if (location) {
      creatorQuery.location = { $regex: location, $options: 'i' }
    }

    if (hashtag) {
      creatorQuery.hashtags = hashtag.startsWith('#') ? hashtag : `#${hashtag}`
    }

    // Clean up $or if empty
    if (creatorQuery.$or.length === 0) delete creatorQuery.$or

    const creators = await CreatorModel.find(creatorQuery)
    const creatorIds = creators.map(c => c._id.toString())
    posts = posts.filter(p => {
      const cid = (p.creatorId as any)?._id?.toString() || p.creatorId?.toString()
      return creatorIds.includes(cid)
    })
  }

  // Sort
  if (sort === 'trending') {
    // Get purchase counts
    const purchaseCounts = await PurchaseModel.aggregate([
      { $group: { _id: '$postId', count: { $sum: 1 } } }
    ])
    const countMap = purchaseCounts.reduce((acc, pc) => {
      acc[pc._id] = pc.count
      return acc
    }, {} as Record<string, number>)

    posts = posts.sort((a, b) => (countMap[b._id] || 0) - (countMap[a._id] || 0))
  } else {
    posts = posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  return NextResponse.json({ posts: posts.slice(0, 50) }) // limit to 50
}
