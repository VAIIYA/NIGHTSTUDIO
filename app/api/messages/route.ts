import { NextRequest, NextResponse } from 'next/server'
import { turso } from '@/lib/turso'
import { verifyToken } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const otherUser = searchParams.get('otherUser')

        // Auth check
        const authHeader = req.headers.get('authorization')
        if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const payload = verifyToken(authHeader.split(' ')[1])
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

        const myWallet = payload.walletAddress
        if (!otherUser) return NextResponse.json({ error: 'Other user required' }, { status: 400 })

        const result = await turso.execute({
            sql: `SELECT * FROM messages 
                  WHERE (sender = ? AND recipient = ?) OR (sender = ? AND recipient = ?)
                  ORDER BY createdAt ASC`,
            args: [myWallet, otherUser, otherUser, myWallet]
        })

        return NextResponse.json(result.rows)
    } catch (e) {
        console.error('Messages fetch error', e)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization')
        if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const payload = verifyToken(authHeader.split(' ')[1])
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

        const { recipient, content, storachaCID, priceUSDC } = await req.json()
        const id = uuidv4()
        const isUnlocked = (priceUSDC || 0) === 0 ? 1 : 0

        await turso.execute({
            sql: `INSERT INTO messages (
                id, sender, recipient, content, storachaCID, priceUSDC, isUnlocked
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            args: [
                id,
                payload.walletAddress,
                recipient,
                content || null,
                storachaCID || null,
                priceUSDC || 0,
                isUnlocked
            ]
        })

        // Return created message
        return NextResponse.json({
            id,
            sender: payload.walletAddress,
            recipient,
            content,
            storachaCID,
            priceUSDC: priceUSDC || 0,
            isUnlocked: Boolean(isUnlocked),
            createdAt: new Date()
        })
    } catch (e) {
        console.error('Messages send error', e)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
