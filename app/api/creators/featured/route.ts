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
            // Safe parse JSONs
            try { if (typeof c.socialLinks === 'string') c.socialLinks = JSON.parse(c.socialLinks) } catch { }
            try { if (typeof c.hashtags === 'string') c.hashtags = JSON.parse(c.hashtags) } catch { }
            return c
        })

        return NextResponse.json({ creators })
    } catch (e) {
        console.error('Featured creators error:', e)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
