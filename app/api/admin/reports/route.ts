import { NextRequest, NextResponse } from 'next/server'
import { connectDb } from '@/lib/db'
import { ReportModel } from '@/models/Report'
import { PostModel } from '@/models/Post'

export async function GET(req: NextRequest) {
  try {
    await connectDb()
    // Assume admin auth, for now skip
    const reports = await ReportModel.find({ status: 'pending' })
      .populate({
        path: 'postId',
        select: 'content creatorId'
      })
      .lean()

    return NextResponse.json({ reports })
  } catch (e) {
    console.error('Admin reports fetch error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDb()
    const { reportId, action } = await req.json() // action: 'dismiss' or 'remove'

    const report = await ReportModel.findById(reportId)
    if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 })

    if (action === 'dismiss') {
      report.status = 'dismissed'
      await report.save()
    } else if (action === 'remove') {
      // Remove post
      await PostModel.findByIdAndDelete(report.postId)
      report.status = 'reviewed'
      await report.save()
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Admin report action error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
