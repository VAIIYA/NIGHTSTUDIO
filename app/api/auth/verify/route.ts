import { NextRequest, NextResponse } from 'next/server'
import nacl from 'tweetnacl'
import bs58 from 'bs58'
import { v4 as uuidv4 } from 'uuid'
import { verifyToken, generateToken } from '@/lib/auth'
import { turso } from '@/lib/turso'

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

    // Check if user exists, if not create
    const userResult = await turso.execute({
      sql: 'SELECT * FROM users WHERE walletAddress = ?',
      args: [walletAddress]
    })

    if (userResult.rows.length === 0) {
      const userId = uuidv4()
      await turso.execute({
        sql: 'INSERT INTO users (id, walletAddress, role) VALUES (?, ?, ?)',
        args: [userId, walletAddress, 'user']
      })
    }

    const token = generateToken({ walletAddress }, '7d')
    return NextResponse.json({ token })
  } catch (e) {
    console.error('Auth verify error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
