import { STORACHA_SPACE_DID } from './storacha-env'
import { isRealStorageEnabled } from './featureFlags'

export async function uploadToStoracha(buffer: Buffer, filename: string): Promise<string> {
  // Use mock CID unless real storage is explicitly enabled in environment
  if (!isRealStorageEnabled()) {
    return `proto-mock:${filename}:${Date.now()}`
  }
  // This is a pragmatic Storacha uploader using their HTTP API.
  // Replace with the real endpoint and auth if needed.
  const endpoint = 'https://storacha.space/v1/upload'
  const FormData = require('form-data')
  const form = new FormData()
  form.append('spaceDid', STORACHA_SPACE_DID)
  form.append('file', buffer, { filename, contentType: 'image/jpeg' })

  const res = await fetch(endpoint, {
    method: 'POST',
    body: form as any,
    headers: {
      // Intentionally minimal headers; server may inject auth via spaceDid
    } as any,
  })
  if (!res.ok) {
    throw new Error(`Storacha upload failed: ${res.status} ${res.statusText}`)
  }
  const data = await res.json()
  // Expecting { cid: '...'}
  if (!data?.cid) throw new Error('Storacha response missing cid')
  return data.cid
}

// Local helper to avoid importing env during SSR for this file
export function ensureStorachaEnv() {
  if (!process.env.STORACHA_SPACE_DID) {
    throw new Error('STORACHA_SPACE_DID not configured')
  }
}
