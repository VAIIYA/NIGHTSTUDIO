import { NextRequest, NextResponse } from 'next/server'
import { turso } from '@/lib/turso'
import { verifyToken } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const creator = searchParams.get('creator')
        if (!creator) return NextResponse.json({ error: 'Creator wallet required' }, { status: 400 })

        const result = await turso.execute({
            sql: 'SELECT * FROM subscription_tiers WHERE creator = ? AND isActive = 1 ORDER BY price ASC',
            args: [creator]
        })

        const tiers = result.rows.map(t => {
            try { if (typeof t.benefits === 'string') t.benefits = JSON.parse(t.benefits) } catch { }
            return t
        })

        return NextResponse.json(tiers)
    } catch (e) {
        console.error('Tiers fetch error', e)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization')
        if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const payload = verifyToken(authHeader.split(' ')[1])
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

        const body = await req.json()
        const { name, description, price, benefits } = body

        const id = uuidv4()
        const benefitsJSON = JSON.stringify(benefits || [])

        await turso.execute({
            sql: `INSERT INTO subscription_tiers (
                id, creator, name, description, price, benefits, isActive
            ) VALUES (?, ?, ?, ?, ?, ?, 1)`,
            args: [
                id,
                payload.walletAddress,
                name,
                description || null,
                Number(price),
                benefitsJSON
            ]
        })

        // Return object structure similar to what frontend expects
        return NextResponse.json({
            id,
            creator: payload.walletAddress,
            name,
            description,
            price: Number(price),
            benefits: benefits || [],
            isActive: true,
            createdAt: new Date()
        })
    } catch (e) {
        console.error('Tiers create error', e)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
