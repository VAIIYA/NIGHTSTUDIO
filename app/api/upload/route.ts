import { NextRequest, NextResponse } from 'next/server';
import * as Client from '@web3-storage/w3up-client';
import { StoreMemory } from '@web3-storage/w3up-client/stores/memory';

const SPACE_DID = process.env.STORACHA_SPACE_DID;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP' },
        { status: 400 }
      );
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 10MB' },
        { status: 400 }
      );
    }

    if (!SPACE_DID) {
      console.error('STORACHA_SPACE_DID not configured');
      return NextResponse.json(
        { error: 'Upload service not configured' },
        { status: 500 }
      );
    }

    const client = await Client.create({ store: new StoreMemory() });
    
    const space = await client.createSpace('nightstudio-upload');
    await client.setCurrentSpace(space.did());

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const cid = await client.uploadFile(new File([buffer], file.name, { type: file.type }));

    const url = `https://${cid}.ipfs.dweb.link`;

    return NextResponse.json({ 
      cid: cid.toString(),
      url,
      filename: file.name,
      size: file.size,
      type: file.type
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}