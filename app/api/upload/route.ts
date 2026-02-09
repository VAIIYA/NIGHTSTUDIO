import { NextRequest, NextResponse } from 'next/server'
import { connectDb } from '@/lib/db'
import { uploadToLighthouse } from '@/lib/lighthouse'
import { fileTypeFromBuffer } from 'file-type'

export async function POST(req: NextRequest) {
  await connectDb()
  const data = await req.json()
  const { filename } = data
  let { imageBase64 } = data
  if (!filename || !imageBase64) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Strip data URL prefix if present (e.g., data:image/jpeg;base64,)
  if (imageBase64.includes(',')) {
    imageBase64 = imageBase64.split(',')[1]
  }

  // Validate image
  const buffer = Buffer.from(imageBase64, 'base64')
  if (buffer.length > 10 * 1024 * 1024) { // 10MB
    return NextResponse.json({ error: 'Image too large (max 10MB)' }, { status: 400 })
  }
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
  // Check mime type from buffer
  const mime = await fileTypeFromBuffer(buffer)
  if (!mime || !allowedTypes.includes(mime.mime)) {
    return NextResponse.json({ error: 'Invalid image type (JPEG/PNG only)' }, { status: 400 })
  }

  try {
    const cid = await uploadToLighthouse(buffer, filename)
    return NextResponse.json({ cid })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 })
  }
}
