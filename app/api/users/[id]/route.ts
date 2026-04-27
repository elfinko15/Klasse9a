import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

// GET: einzelnen Benutzer laden (öffentlich für eingeloggte)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht eingeloggt.' }, { status: 401 })

  const { id } = await params
  const { data, error } = await db
    .from('users')
    .select('id, name, username, role, bio, profile_picture_url, created_at')
    .eq('id', id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Benutzer nicht gefunden.' }, { status: 404 })
  return NextResponse.json({ user: data })
}

// DELETE: Benutzer löschen (nur Admins)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Kein Zugriff.' }, { status: 403 })
  }

  const { id } = await params

  // Admin darf sich nicht selbst löschen
  if (id === session.userId) {
    return NextResponse.json({ error: 'Du kannst dich nicht selbst löschen.' }, { status: 400 })
  }

  const { error } = await db.from('users').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
