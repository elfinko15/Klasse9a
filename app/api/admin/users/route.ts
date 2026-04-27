import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

// GET: alle Benutzer (Admins + Schüler) – nur für Admins
export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Kein Zugriff.' }, { status: 403 })
  }

  const { data, error } = await db
    .from('users')
    .select('id, name, username, role, bio, profile_picture_url, created_at')
    .order('role', { ascending: false }) // admins first
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ users: data })
}
