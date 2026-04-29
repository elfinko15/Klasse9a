import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Kein Zugriff.' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const updates: Record<string, unknown> = {}
  if (typeof body.is_visible === 'boolean') updates.is_visible = body.is_visible
  if (typeof body.is_anonymous === 'boolean') updates.is_anonymous = body.is_anonymous

  const { error } = await db.from('polls').update(updates).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Kein Zugriff.' }, { status: 403 })
  }

  const { id } = await params
  const { error } = await db.from('polls').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
