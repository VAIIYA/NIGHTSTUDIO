export const USE_REAL_STORAGE = (process.env.USE_REAL_STORAGE === 'true')

export function isRealStorageEnabled(): boolean {
  return USE_REAL_STORAGE
}
