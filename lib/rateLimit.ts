// Simple in-memory rate limiter (for demo; use Redis in prod)
const requests = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(key: string, limit: number = 10, windowMs: number = 60000) {
  const now = Date.now()
  const entry = requests.get(key)

  if (!entry || now > entry.resetTime) {
    requests.set(key, { count: 1, resetTime: now + windowMs })
    return false // not limited
  }

  if (entry.count >= limit) {
    return true // limited
  }

  entry.count++
  return false
}