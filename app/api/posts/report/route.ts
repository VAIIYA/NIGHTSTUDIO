import { NextRequest, NextResponse } from 'next/server'
import { turso } from '@/lib/turso'
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

    const reporterId = payload.walletAddress
    const { postId, reason } = await req.json()
    if (!postId || !reason) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const id = uuidv4()
    await turso.execute({
      sql: 'INSERT INTO reports (id, postId, reporterId, reason, status) VALUES (?, ?, ?, ?, ?)',
      args: [id, postId, reporterId, reason, 'pending']
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Report error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
