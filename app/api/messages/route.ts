import { NextRequest, NextResponse } from 'next/server'
import { connectDb } from '@/lib/db'
import MessageModel from '@/models/Message'
import { verifyToken } from '@/lib/auth'

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
        await connectDb()

        const messages = await MessageModel.find({
            $or: [
                { sender: myWallet, recipient: otherUser },
                { sender: otherUser, recipient: myWallet }
            ]
        }).sort({ createdAt: 1 })

        return NextResponse.json(messages)
    } catch (e) {
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization')
        if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const payload = verifyToken(authHeader.split(' ')[1])
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

        await connectDb()
        const { recipient, content, storachaCID, priceUSDC } = await req.json()

        const msg = new MessageModel({
            sender: payload.walletAddress,
            recipient,
            content,
            storachaCID,
            priceUSDC: priceUSDC || 0,
            isUnlocked: (priceUSDC || 0) === 0 // Free messages are unlocked by default
        })

        await msg.save()
        return NextResponse.json(msg)
    } catch (e) {
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
