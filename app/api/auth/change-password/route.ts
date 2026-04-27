import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/supabase'
import { getSession, createSessionToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht eingeloggt.' }, { status: 401 })

  const { newPassword } = await req.json()

  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: 'Passwort muss mindestens 6 Zeichen haben.' }, { status: 400 })
  }

  const password_hash = await bcrypt.hash(newPassword, 12)

  const { error } = await db
    .from('users')
    .update({ password_hash, must_change_password: false })
    .eq('id', session.userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Neues Token ohne mustChangePassword Flag
  const newToken = await createSessionToken({
    ...session,
    mustChangePassword: false,
  })

  const res = NextResponse.json({ ok: true })
  res.cookies.set('session', newToken, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  })

  return res
}
