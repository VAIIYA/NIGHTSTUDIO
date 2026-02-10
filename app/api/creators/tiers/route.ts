import { NextRequest, NextResponse } from 'next/server'
import { connectDb } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { SubscriptionTierModel } from '@/models/Subscription'

export async function GET(req: NextRequest) {
    try {
        await connectDb()
        const { searchParams } = new URL(req.url)
        const creator = searchParams.get('creator')
        if (!creator) return NextResponse.json({ error: 'Creator wallet required' }, { status: 400 })

        const tiers = await SubscriptionTierModel.find({
            creator,
            isActive: true
        }).sort({ price: 1 }).lean()

        return NextResponse.json(tiers)
    } catch (e) {
        console.error('Tiers fetch error', e)
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

        const body = await req.json()
        const { name, description, price, benefits } = body

        const tier = new SubscriptionTierModel({
            creator: payload.walletAddress,
            name,
            description,
            price: Number(price),
            benefits: benefits || [],
            isActive: true
        })

        await tier.save()

        return NextResponse.json(tier)
    } catch (e) {
        console.error('Tiers create error', e)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
