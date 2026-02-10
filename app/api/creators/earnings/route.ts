import { NextRequest, NextResponse } from 'next/server'
import { connectDb } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { CreatorModel } from '@/models/User'
import { PostModel } from '@/models/Post'
import { PurchaseModel } from '@/models/Purchase'

export async function GET(req: NextRequest) {
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

    const creator = await CreatorModel.findOne({ walletAddress }).lean()
    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
    }

    // Fetch posts by this creator
    const posts = await PostModel.find({ creatorId: creator._id }).select('_id')
    const postIds = posts.map(p => p._id)

    // Fetch purchases for creator's posts
    const purchases = await PurchaseModel.find({
      postId: { $in: postIds }
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()

    // Calculate earnings: 90% of amount
    const totalEarned = purchases.reduce((sum: number, p: any) => sum + (Number(p.amount) * 0.9 / 1e6), 0)
    const platformFee = purchases.reduce((sum: number, p: any) => sum + (Number(p.amount) * 0.1 / 1e6), 0)

    // Group by date for chart
    const earningsByDate = purchases.reduce((acc: any, p: any) => {
      const date = new Date(p.createdAt).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + (Number(p.amount) * 0.9 / 1e6)
      return acc
    }, {} as Record<string, number>)

    const chartData = Object.entries(earningsByDate).map(([date, earnings]) => ({ date, earnings }))

    return NextResponse.json({
      totalEarned,
      platformFee,
      totalPurchases: purchases.length,
      purchaseHistory: purchases.slice(0, 10),
      chartData,
    })
  } catch (e) {
    console.error('Earnings error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
