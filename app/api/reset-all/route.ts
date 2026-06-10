import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const SECRET = 'klasse9a-reset-2026'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('key') !== SECRET) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const db = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const hash = await bcrypt.hash('Schule123', 10)
  const { error, count } = await db
    .from('users')
    .update({ password_hash: hash, must_change_password: true })
    .neq('id', '00000000-0000-0000-0000-000000000000')
    .select('id', { count: 'exact', head: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, updated: count })
}
