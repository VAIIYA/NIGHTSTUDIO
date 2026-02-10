import { NextRequest, NextResponse } from 'next/server'
import { turso } from '@/lib/turso'
import { verifyToken } from '@/lib/auth'
import { uploadToStoracha } from '@/lib/storacha'
import { isRealStorageEnabled } from '@/lib/featureFlags'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        // Try finding by ID first, then by wallet address
        let creatorResult = await turso.execute({
            sql: 'SELECT * FROM creators WHERE id = ?',
            args: [params.id]
        })

        if (creatorResult.rows.length === 0) {
            creatorResult = await turso.execute({
                sql: 'SELECT * FROM creators WHERE walletAddress = ?',
                args: [params.id]
            })
        }

        if (creatorResult.rows.length === 0) return NextResponse.json({ error: 'Creator not found' }, { status: 404 })

        const creator = { ...creatorResult.rows[0], _id: (creatorResult.rows[0] as any).id } as any
        // Parse JSON fields
        try { if (typeof creator.socialLinks === 'string') creator.socialLinks = JSON.parse(creator.socialLinks) } catch { }
        try { if (typeof creator.hashtags === 'string') creator.hashtags = JSON.parse(creator.hashtags) } catch { }

        return NextResponse.json({ creator })
    } catch (e) {
        console.error('Creator fetch error:', e)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const authHeader = req.headers.get('authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const token = authHeader.split(' ')[1]
        const payload = verifyToken(token)
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

        const walletAddress = payload.walletAddress

        // Find creator - only the owner can update
        const creatorRes = await turso.execute({
            sql: 'SELECT * FROM creators WHERE walletAddress = ?',
            args: [walletAddress]
        })

        if (creatorRes.rows.length === 0) return NextResponse.json({ error: 'Creator profile not found' }, { status: 404 })
        const creator = creatorRes.rows[0] as any

        const body = await req.json()
        const { bio, avatarBase64, username, location, hashtags, socialLinks } = body

        // Validations
        if (username && (typeof username !== 'string' || !/^[a-zA-Z0-9_]{3,20}$/.test(username))) {
            return NextResponse.json({ error: 'Username must be 3-20 characters, alphanumeric and underscores only' }, { status: 400 })
        }

        if (username && username !== creator.username) {
            const existing = await turso.execute({
                sql: 'SELECT id FROM creators WHERE username = ? AND walletAddress != ?',
                args: [username, walletAddress]
            })
            if (existing.rows.length > 0) return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
        }

        const updates: string[] = []
        const args: any[] = []

        if (username !== undefined) { updates.push('username = ?'); args.push(username) }
        if (bio !== undefined) { updates.push('bio = ?'); args.push(bio) }
        if (location !== undefined) { updates.push('location = ?'); args.push(location) }

        if (socialLinks !== undefined) {
            let currentLinks = {}
            try { currentLinks = typeof creator.socialLinks === 'string' ? JSON.parse(creator.socialLinks) : {} } catch { }
            const newLinks = { ...currentLinks, ...socialLinks }
            updates.push('socialLinks = ?'); args.push(JSON.stringify(newLinks))
        }

        if (hashtags !== undefined) {
            const tags = hashtags.slice(0, 10).map((h: string) => h.startsWith('#') ? h : `#${h}`)
            updates.push('hashtags = ?'); args.push(JSON.stringify(tags))
        }

        if (avatarBase64 && avatarBase64.startsWith('data:image/')) {
            let avatarCID = creator.avatar
            if (isRealStorageEnabled()) {
                const buffer = Buffer.from(avatarBase64.split(',')[1], 'base64')
                avatarCID = await uploadToStoracha(buffer, 'avatar.jpg')
            } else {
                avatarCID = avatarBase64
            }
            updates.push('avatar = ?'); args.push(avatarCID)
        }

        if (updates.length > 0) {
            args.push(creator.id) // Query by ID
            await turso.execute({
                sql: `UPDATE creators SET ${updates.join(', ')} WHERE id = ?`,
                args
            })
        }

        // Fetch updated
        const updatedRes = await turso.execute({ sql: 'SELECT * FROM creators WHERE id = ?', args: [(creator as any).id] })
        const updatedCreator = { ...updatedRes.rows[0], _id: (updatedRes.rows[0] as any).id } as any
        // Parse JSON fields
        try { if (typeof updatedCreator.socialLinks === 'string') updatedCreator.socialLinks = JSON.parse(updatedCreator.socialLinks) } catch { }
        try { if (typeof updatedCreator.hashtags === 'string') updatedCreator.hashtags = JSON.parse(updatedCreator.hashtags) } catch { }

        return NextResponse.json({ success: true, creator: updatedCreator })
    } catch (e) {
        console.error('Creator update error:', e)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
