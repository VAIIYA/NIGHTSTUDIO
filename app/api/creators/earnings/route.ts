import { NextRequest, NextResponse } from 'next/server'
import { turso } from '@/lib/turso'
import { verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.split(' ')[1]
    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const walletAddress = payload.walletAddress

    const creatorRes = await turso.execute({
      sql: 'SELECT id, walletAddress FROM creators WHERE walletAddress = ?',
      args: [walletAddress]
    })

    if (creatorRes.rows.length === 0) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
    }

    const creator = creatorRes.rows[0]

    // Fetch purchases for creator's posts
    // We need to join purchases -> posts -> creators
    const purchasesRes = await turso.execute({
      sql: `
            SELECT pu.*, pu.createdAt as purchaseDate 
            FROM purchases pu
            JOIN posts po ON pu.postId = po.id
            WHERE po.creatorId = ?
            ORDER BY pu.createdAt DESC
            LIMIT 100
        `,
      args: [creator.id]
    })

    const purchases = purchasesRes.rows

    // Calculate earnings: 90% of amount (amount is in USDC lamports *1e6 or whatever unit)
    // Assuming amount is stored as-is from frontend (likely 1000000 for 1 USDC)
    const totalEarned = purchases.reduce((sum: number, p: any) => sum + (Number(p.amount) * 0.9 / 1e6), 0) // convert to USDC
    const platformFee = purchases.reduce((sum: number, p: any) => sum + (Number(p.amount) * 0.1 / 1e6), 0)

    // Group by date for chart
    const earningsByDate = purchases.reduce((acc: any, p: any) => {
      // p.createdAt might be a string in SQLite/Turso
      const date = String(p.purchaseDate).split('T')[0]
      acc[date] = (acc[date] || 0) + (Number(p.amount) * 0.9 / 1e6)
      return acc
    }, {} as Record<string, number>)

    const chartData = Object.entries(earningsByDate).map(([date, earnings]) => ({ date, earnings }))

    return NextResponse.json({
      totalEarned,
      platformFee,
      totalPurchases: purchases.length, // total fetched (capped at 100 for now, should be separate count query for accurate totals)
      purchaseHistory: purchases.slice(0, 10), // last 10
      chartData,
    })
  } catch (e) {
    console.error('Earnings error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
