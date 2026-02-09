import { NextRequest, NextResponse } from 'next/server'
import { createSubscriptionTier, getCreatorTiers, updateSubscriptionTier } from '@/lib/server-actions'

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url)
        const creator = url.searchParams.get('creator')

        if (!creator) {
            return NextResponse.json({ error: 'Creator parameter required' }, { status: 400 })
        }

        const tiers = await getCreatorTiers(creator)
        return NextResponse.json({ tiers })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { creator, name, description, price, benefits } = body

        if (!creator || !name || price === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const tier = await createSubscriptionTier({
            creator,
            name,
            description,
            price,
            benefits
        })

        return NextResponse.json({ tier }, { status: 201 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { tierId, creator, name, description, price, benefits, isActive } = body

        if (!tierId || !creator) {
            return NextResponse.json({ error: 'Missing tierId or creator' }, { status: 400 })
        }

        const tier = await updateSubscriptionTier(tierId, creator, {
            name,
            description,
            price,
            benefits,
            isActive
        })

        return NextResponse.json({ tier })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}