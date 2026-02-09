import { NextRequest, NextResponse } from 'next/server'
import { connectDb } from '@/lib/db'
import ReportModel from '@/models/Report'

export async function GET(req: NextRequest) {
  await connectDb()
  // Assume admin auth, for now skip
  const reports = await ReportModel.find({ status: 'pending' }).populate('postId')
  return NextResponse.json({ reports })
}

export async function POST(req: NextRequest) {
  await connectDb()
  const { reportId, action } = await req.json() // action: 'dismiss' or 'remove'
  const report = await ReportModel.findById(reportId)
  if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 })

  if (action === 'dismiss') {
    report.status = 'dismissed'
  } else if (action === 'remove') {
    // Remove post
    await (require('../../../../models/Post').default).findByIdAndDelete(report.postId)
    report.status = 'reviewed'
  }
  await report.save()
  return NextResponse.json({ success: true })
}
