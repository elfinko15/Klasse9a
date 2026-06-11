import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

const SECRET = 'klasse9a-reset-2026'
// bcrypt hash of 'Schule123'
const HASH = '$2b$10$pACofiDWQ/3JQZ03ptaYo.Vi4qAxhxVLH6VHB3XWCJlhz1F9HI35S'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('key') !== SECRET) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const { error } = await db
    .from('users')
    .update({ password_hash: HASH, must_change_password: true })
    .neq('id', '00000000-0000-0000-0000-000000000000')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
