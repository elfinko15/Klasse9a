import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

const DEFAULT_PASSWORD = 'Schule123'

// GET: alle Schüler laden (nur für eingeloggte Benutzer)
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht eingeloggt.' }, { status: 401 })

  const { data, error } = await db
    .from('users')
    .select('id, name, username, role, bio, profile_picture_url, created_at')
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ users: data })
}

// POST: neuen Benutzer erstellen (nur Admins)
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Kein Zugriff.' }, { status: 403 })
  }

  const { name, username, role } = await req.json()

  if (!name?.trim() || !username?.trim()) {
    return NextResponse.json({ error: 'Name und Benutzername erforderlich.' }, { status: 400 })
  }

  const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '')
  if (cleanUsername.length < 3) {
    return NextResponse.json({ error: 'Benutzername zu kurz (min. 3 Zeichen).' }, { status: 400 })
  }

  // Prüfen ob Username schon vergeben
  const { data: existing } = await db
    .from('users')
    .select('id')
    .eq('username', cleanUsername)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Dieser Benutzername ist bereits vergeben.' }, { status: 409 })
  }

  const password_hash = await bcrypt.hash(DEFAULT_PASSWORD, 12)

  const { data, error } = await db
    .from('users')
    .insert({
      name: name.trim(),
      username: cleanUsername,
      password_hash,
      role: role === 'admin' ? 'admin' : 'student',
    })
    .select('id, name, username, role, bio, profile_picture_url, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ user: data }, { status: 201 })
}
