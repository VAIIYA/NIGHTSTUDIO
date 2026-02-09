import { NextRequest, NextResponse } from 'next/server'
import { followUser, unfollowUser, isFollowing, getFollowers, getFollowing } from '@/lib/server-actions'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { follower, following } = body

        if (!follower || !following) {
            return NextResponse.json({ error: 'Missing follower or following' }, { status: 400 })
        }

        const follow = await followUser(follower, following)
        return NextResponse.json({ success: true, follow }, { status: 201 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json()
        const { follower, following } = body

        if (!follower || !following) {
            return NextResponse.json({ error: 'Missing follower or following' }, { status: 400 })
        }

        await unfollowUser(follower, following)
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url)
        const follower = url.searchParams.get('follower')
        const following = url.searchParams.get('following')
        const userId = url.searchParams.get('userId')
        const type = url.searchParams.get('type') // 'followers' or 'following'
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100)
        const offset = Math.max(parseInt(url.searchParams.get('offset') || '0'), 0)

        if (follower && following) {
            // Check if user A follows user B
            const isFollowingResult = await isFollowing(follower, following)
            return NextResponse.json({ isFollowing: isFollowingResult })
        }

        if (userId && type === 'followers') {
            const followers = await getFollowers(userId, limit, offset)
            return NextResponse.json({ followers })
        }

        if (userId && type === 'following') {
            const following = await getFollowing(userId, limit, offset)
            return NextResponse.json({ following })
        }

        return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}