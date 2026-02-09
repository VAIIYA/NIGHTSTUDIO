import { NextRequest, NextResponse } from 'next/server'
import { connectDb } from '@/lib/db'
import ReportModel from '@/models/Report'
import { verifyToken, JWTPayload } from '@/lib/auth'

export async function POST(req: NextRequest) {
  await connectDb()
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const token = authHeader.split(' ')[1]
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const reporterId = payload.walletAddress
  const { postId, reason } = await req.json()
  if (!postId || !reason) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const report = new ReportModel({ postId, reporterId, reason })
  await report.save()

  return NextResponse.json({ success: true })
}
