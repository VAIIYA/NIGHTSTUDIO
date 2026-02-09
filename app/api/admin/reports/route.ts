import { NextRequest, NextResponse } from 'next/server'
import { turso } from '@/lib/turso'

export async function GET(req: NextRequest) {
  try {
    // Assume admin auth, for now skip
    // Fetch reports and join with posts to get logic similar to populate
    const result = await turso.execute({
      sql: `
              SELECT r.*, p.content as postContent, p.creatorId as postCreator 
              FROM reports r
              LEFT JOIN posts p ON r.postId = p.id
              WHERE r.status = 'pending'
          `,
      args: []
    })

    const reports = result.rows.map(r => ({
      ...r,
      postId: { // Mimic populated object structure if frontend expects it
        _id: r.postId,
        id: r.postId,
        content: r.postContent,
        creatorId: r.postCreator
      }
    }))

    return NextResponse.json({ reports })
  } catch (e) {
    console.error('Admin reports fetch error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { reportId, action } = await req.json() // action: 'dismiss' or 'remove'

    const reportRes = await turso.execute({
      sql: 'SELECT * FROM reports WHERE id = ?',
      args: [reportId]
    })

    if (reportRes.rows.length === 0) return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    const report = reportRes.rows[0]

    if (action === 'dismiss') {
      await turso.execute({
        sql: "UPDATE reports SET status = 'dismissed' WHERE id = ?",
        args: [reportId]
      })
    } else if (action === 'remove') {
      // Remove post
      await turso.execute({
        sql: 'DELETE FROM posts WHERE id = ?',
        args: [report.postId]
      })
      await turso.execute({
        sql: "UPDATE reports SET status = 'reviewed' WHERE id = ?",
        args: [reportId]
      })
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Admin report action error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
