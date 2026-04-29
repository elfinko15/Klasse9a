import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht eingeloggt.' }, { status: 401 })

  const { id: poll_id } = await params
  const { option_id } = await req.json()
  if (!option_id) return NextResponse.json({ error: 'option_id fehlt.' }, { status: 400 })

  // Verify option belongs to this poll
  const { data: option } = await db.from('poll_options').select('id').eq('id', option_id).eq('poll_id', poll_id).single()
  if (!option) return NextResponse.json({ error: 'Ungültige Option.' }, { status: 400 })

  // Check poll is visible
  const { data: poll } = await db.from('polls').select('is_visible').eq('id', poll_id).single()
  if (!poll?.is_visible && session.role !== 'admin') {
    return NextResponse.json({ error: 'Umfrage nicht verfügbar.' }, { status: 403 })
  }

  // Upsert vote (handles changing vote)
  const { error } = await db.from('poll_votes').upsert(
    { poll_id, option_id, user_id: session.userId },
    { onConflict: 'poll_id,user_id' }
  )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
