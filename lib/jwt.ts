import { SignJWT, jwtVerify } from 'jose'
import type { SessionUser } from './auth'

function getSecret() {
  const s = process.env.JWT_SECRET || 'fallback-secret-for-build-time'
  return new TextEncoder().encode(s)
}

export async function createToken(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as unknown as SessionUser
  } catch {
    return null
  }
}
