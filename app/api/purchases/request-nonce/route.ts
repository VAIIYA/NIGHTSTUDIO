import { NextRequest, NextResponse } from 'next/server'
import { connectDb } from '@/lib/db'
import NonceModel from '@/models/Nonce'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  await connectDb()
  const { postId } = await req.json()
  if (!postId) return NextResponse.json({ error: 'PostId required' }, { status: 400 })

  // Assume userId from JWT or session
  // For now, placeholder
  const userId = 'placeholder-user'

  const nonce = uuidv4()
  const newNonce = new NonceModel({ postId, userId, nonce })
  await newNonce.save()

  return NextResponse.json({ nonce })
}
