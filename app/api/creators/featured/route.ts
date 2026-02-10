import { NextRequest, NextResponse } from 'next/server'
import { connectDb } from '@/lib/db'
import { CreatorModel } from '@/models/User'

export async function GET(req: NextRequest) {
    try {
        await connectDb()
        const creators = await CreatorModel.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        return NextResponse.json({ creators })
    } catch (e) {
        console.error('Featured creators error:', e)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
