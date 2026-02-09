import { NextRequest, NextResponse } from 'next/server'
import { subscribeToTier, getActiveSubscription, getCreatorSubscribers, getSubscriberSubscriptions, cancelSubscription, renewSubscription, hasSubscriptionAccess } from '@/lib/server-actions'

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url)
        const subscriber = url.searchParams.get('subscriber')
        const creator = url.searchParams.get('creator')
        const type = url.searchParams.get('type') // 'active', 'subscribers', 'subscriptions'

        if (subscriber && creator) {
            // Check active subscription between subscriber and creator
            const subscription = await getActiveSubscription(subscriber, creator)
            const hasAccess = await hasSubscriptionAccess(subscriber, creator)
            return NextResponse.json({ subscription, hasAccess })
        }

        if (creator && type === 'subscribers') {
            const subscribers = await getCreatorSubscribers(creator)
            return NextResponse.json({ subscribers })
        }

        if (subscriber && type === 'subscriptions') {
            const subscriptions = await getSubscriberSubscriptions(subscriber)
            return NextResponse.json({ subscriptions })
        }

        return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { subscriber, creator, tierId } = body

        if (!subscriber || !creator || !tierId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const subscription = await subscribeToTier({
            subscriber,
            creator,
            tierId
        })

        return NextResponse.json({ subscription }, { status: 201 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { subscriptionId, subscriber, action } = body

        if (!subscriptionId || !subscriber || !action) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        if (action === 'cancel') {
            await cancelSubscription(subscriptionId, subscriber)
            return NextResponse.json({ success: true })
        }

        if (action === 'renew') {
            const { amount } = body
            if (!amount) {
                return NextResponse.json({ error: 'Amount required for renewal' }, { status: 400 })
            }
            await renewSubscription(subscriptionId, amount)
            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}