import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

export type SessionUser = {
  userId: string
  role: 'admin' | 'student'
  name: string
  username: string
  mustChangePassword: boolean
}

function getSecret() {
  const s = process.env.JWT_SECRET || 'fallback-secret-for-build-time'
  return new TextEncoder().encode(s)
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as unknown as SessionUser
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null
  return verifySessionToken(token)
}
