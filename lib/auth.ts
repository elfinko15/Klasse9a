import { cookies } from 'next/headers'
import { createToken, verifyToken } from './jwt'

export type SessionUser = {
  userId: string
  role: 'admin' | 'student'
  name: string
  username: string
  mustChangePassword: boolean
}

export { createToken as createSessionToken, verifyToken as verifySessionToken }

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null
  return verifyToken(token)
}
