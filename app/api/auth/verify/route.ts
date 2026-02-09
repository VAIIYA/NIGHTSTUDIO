import { NextRequest, NextResponse } from 'next/server'
import nacl from 'tweetnacl'
import bs58 from 'bs58'
import { verifyToken, generateToken, JWTPayload } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { walletAddress, message, signature } = body

    if (!walletAddress || typeof walletAddress !== 'string' || !message || typeof message !== 'string' || !signature || !Array.isArray(signature)) {
      return NextResponse.json({ error: 'Invalid or missing fields' }, { status: 400 })
    }

    if (signature.length !== 64) {
      return NextResponse.json({ error: 'Invalid signature length' }, { status: 400 })
    }

    const publicKeyBytes = bs58.decode(walletAddress)
    if (publicKeyBytes.length !== 32) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
    }

    const signatureBytes = new Uint8Array(signature)
    const messageBytes = new TextEncoder().encode(message)

    const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const token = generateToken({ walletAddress }, '7d')
    return NextResponse.json({ token })
  } catch (e) {
    console.error('Auth verify error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
