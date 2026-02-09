import jwt from 'jsonwebtoken'

export interface JWTPayload {
  walletAddress: string
  iat?: number
  exp?: number
}

export function generateToken(payload: object, expiresIn = '7d') {
  const secret = process.env.JWT_SECRET || 'default-secret'
  return jwt.sign(payload, secret as any, { expiresIn: expiresIn as any })
}

export function verifyToken(token: string): JWTPayload | null {
  const secret = process.env.JWT_SECRET || 'default-secret'
  try {
    return jwt.verify(token, secret) as JWTPayload
  } catch {
    return null
  }
}
