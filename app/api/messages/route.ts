import { NextRequest, NextResponse } from 'next/server'
import { connectDb } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { MessageModel } from '@/models/Message'

export async function GET(req: NextRequest) {
    try {
        await connectDb()
        const { searchParams } = new URL(req.url)
        const otherUser = searchParams.get('otherUser')

        // Auth check
        const authHeader = req.headers.get('authorization')
        if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const payload = verifyToken(authHeader.split(' ')[1])
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

        const myWallet = payload.walletAddress
        if (!otherUser) return NextResponse.json({ error: 'Other user required' }, { status: 400 })

        const messages = await MessageModel.find({
            $or: [
                { sender: myWallet, recipient: otherUser },
                { sender: otherUser, recipient: myWallet }
            ]
        }).sort({ createdAt: 1 }).lean()

        return NextResponse.json(messages)
    } catch (e) {
        console.error('Messages fetch error', e)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDb()
        const authHeader = req.headers.get('authorization')
        if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const payload = verifyToken(authHeader.split(' ')[1])
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

        const { recipient, content, storachaCID, priceUSDC } = await req.json()
        const isUnlocked = (priceUSDC || 0) === 0

        const message = new MessageModel({
            sender: payload.walletAddress,
            recipient,
            content,
            storachaCID,
            priceUSDC: priceUSDC || 0,
            isUnlocked
        })

        await message.save()

        return NextResponse.json(message)
    } catch (e) {
        console.error('Messages send error', e)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
