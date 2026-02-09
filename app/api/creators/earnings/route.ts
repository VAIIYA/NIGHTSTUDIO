import { NextRequest, NextResponse } from 'next/server'
import { connectDb } from '@/lib/db'
import PurchaseModel from '@/models/Purchase'
import PostModel from '@/models/Post'
import CreatorModel from '@/models/Creator'
import { verifyToken, JWTPayload } from '@/lib/auth'

export async function GET(req: NextRequest) {
  await connectDb()
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const token = authHeader.split(' ')[1]
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const walletAddress = payload.walletAddress

  const creator = await CreatorModel.findOne({ walletAddress })
  if (!creator) {
    return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
  }

  // Fetch creator posts
  const posts = await PostModel.find({ creatorId: creator._id })
  const postIds = posts.map(p => p._id)

  const purchases = await PurchaseModel.find({ postId: { $in: postIds } }).sort({ createdAt: -1 })

  // Calculate earnings: 90% of amount (amount is in USDC lamports *1e6)
  const totalEarned = purchases.reduce((sum, p) => sum + (p.amount * 0.9 / 1e6), 0) // convert to USDC
  const platformFee = purchases.reduce((sum, p) => sum + (p.amount * 0.1 / 1e6), 0)

  // Group by date for chart
  const earningsByDate = purchases.reduce((acc, p) => {
    const date = p.createdAt.toISOString().split('T')[0]
    acc[date] = (acc[date] || 0) + (p.amount * 0.9 / 1e6)
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(earningsByDate).map(([date, earnings]) => ({ date, earnings }))

  return NextResponse.json({
    totalEarned,
    platformFee,
    totalPurchases: purchases.length,
    purchaseHistory: purchases.slice(0, 10), // last 10
    chartData,
  })
}
