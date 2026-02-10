import { NextRequest, NextResponse } from 'next/server'
import { turso } from '@/lib/turso'
import { v4 as uuidv4 } from 'uuid'
import { verifyToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { postId } = await req.json()
    if (!postId) return NextResponse.json({ error: 'PostId required' }, { status: 400 })

    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.split(' ')[1]
    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const userId = payload.walletAddress

    const nonce = uuidv4()
    const id = uuidv4()

    await turso.execute({
      sql: 'INSERT INTO nonces (id, postId, userId, nonce) VALUES (?, ?, ?, ?)',
      args: [id, postId, userId, nonce]
    })

    return NextResponse.json({ nonce })
  } catch (e) {
    console.error('Nonce error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
