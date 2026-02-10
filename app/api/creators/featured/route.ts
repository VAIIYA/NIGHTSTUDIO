import { NextRequest, NextResponse } from 'next/server'
import { turso } from '@/lib/turso'

export async function GET(req: NextRequest) {
    try {
        // Fetch a few creators, sorted by newest or you could add a 'featured' flag
        const result = await turso.execute({
            sql: 'SELECT * FROM creators ORDER BY createdAt DESC LIMIT 10',
            args: []
        })

        const creators = result.rows.map(c => {
            const creator = { ...c, _id: c.id }
            // Safe parse JSONs
            try { if (typeof creator.socialLinks === 'string') creator.socialLinks = JSON.parse(creator.socialLinks as string) } catch { }
            try { if (typeof creator.hashtags === 'string') creator.hashtags = JSON.parse(creator.hashtags as string) } catch { }
            return creator
        })

        return NextResponse.json({ creators })
    } catch (e) {
        console.error('Featured creators error:', e)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
