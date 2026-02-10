import { NextRequest, NextResponse } from 'next/server'
import nacl from 'tweetnacl'
import bs58 from 'bs58'
import { generateToken } from '@/lib/auth'
import { connectDb } from '@/lib/db'
import { UserModel } from '@/models/User'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { walletAddress, message, signature } = body

    if (!walletAddress || !message || !signature) {
      return NextResponse.json({ error: 'Invalid or missing fields' }, { status: 400 })
    }

    const publicKeyBytes = bs58.decode(walletAddress)
    const signatureBytes = new Uint8Array(signature)
    const messageBytes = new TextEncoder().encode(message)

    const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    await connectDb()
    let user = await UserModel.findOne({ walletAddress })

    if (!user) {
      user = new UserModel({ walletAddress, role: 'user' })
      await user.save()
    }

    const token = generateToken({ walletAddress }, '7d')
    return NextResponse.json({ token })
  } catch (e) {
    console.error('Auth verify error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
