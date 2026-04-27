import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/supabase'
import { createSessionToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  if (!username?.trim() || !password) {
    return NextResponse.json({ error: 'Benutzername und Passwort erforderlich.' }, { status: 400 })
  }

  const { data: user, error } = await db
    .from('users')
    .select('id, name, username, password_hash, role')
    .eq('username', username.trim().toLowerCase())
    .single()

  if (error || !user) {
    return NextResponse.json({ error: 'Benutzername oder Passwort falsch.' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    return NextResponse.json({ error: 'Benutzername oder Passwort falsch.' }, { status: 401 })
  }

  const token = await createSessionToken({
    userId: user.id,
    role: user.role,
    name: user.name,
    username: user.username,
  })

  const res = NextResponse.json({
    ok: true,
    user: { id: user.id, name: user.name, username: user.username, role: user.role },
  })

  res.cookies.set('session', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 Tage
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  })

  return res
}
