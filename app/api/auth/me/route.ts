import { NextRequest, NextResponse } from 'next/server'
import { connectDb } from '@/lib/db'
import UserModel from '@/models/User'
import CreatorModel from '@/models/Creator'
import { verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
    try {
        await connectDb()
        const authHeader = req.headers.get('authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const token = authHeader.split(' ')[1]
        const payload = verifyToken(token)
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

        const user = await UserModel.findOne({ walletAddress: payload.walletAddress })
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

        const creator = await CreatorModel.findOne({ userId: user._id })

        return NextResponse.json({ user, creator })
    } catch (e) {
        console.error('Auth me error:', e)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
