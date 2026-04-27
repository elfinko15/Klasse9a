import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

// POST: Kommentar erstellen (nur eingeloggte Benutzer)
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht eingeloggt.' }, { status: 401 })

  const { target_user_id, message } = await req.json()

  if (!target_user_id || !message?.trim()) {
    return NextResponse.json({ error: 'Nachricht darf nicht leer sein.' }, { status: 400 })
  }
  if (message.length > 1000) {
    return NextResponse.json({ error: 'Nachricht zu lang (max. 1000 Zeichen).' }, { status: 400 })
  }

  // Prüfen ob Zielbenutzer existiert
  const { data: target } = await db
    .from('users')
    .select('id')
    .eq('id', target_user_id)
    .single()

  if (!target) return NextResponse.json({ error: 'Benutzer nicht gefunden.' }, { status: 404 })

  const { data, error } = await db
    .from('comments')
    .insert({
      target_user_id,
      author_id: session.userId,
      message: message.trim(),
    })
    .select(`id, target_user_id, author_id, message, created_at, author:users!author_id(name, username)`)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ comment: data }, { status: 201 })
}
