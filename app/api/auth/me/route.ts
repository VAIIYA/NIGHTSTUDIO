import { NextRequest, NextResponse } from 'next/server'
import { connectDb } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { UserModel, CreatorModel } from '@/models/User'

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const token = authHeader.split(' ')[1]
        const payload = verifyToken(token)
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

        await connectDb()
        const user = await UserModel.findOne({ walletAddress: payload.walletAddress }).lean()

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const creator = await CreatorModel.findOne({ userId: user._id }).lean()

        return NextResponse.json({ user, creator })
    } catch (e: any) {
        console.error('Auth me error:', e)
        return NextResponse.json({ error: 'Internal server error', details: e.message }, { status: 500 })
    }
}
