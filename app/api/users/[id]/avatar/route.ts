import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht eingeloggt.' }, { status: 401 })

  const { id } = await params

  // Only own profile or admin
  if (session.userId !== id && session.role !== 'admin') {
    return NextResponse.json({ error: 'Kein Zugriff.' }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Keine Datei.' }, { status: 400 })

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Datei zu groß (max. 5 MB).' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif']
  if (!allowed.includes(ext)) {
    return NextResponse.json({ error: 'Ungültiges Dateiformat.' }, { status: 400 })
  }

  const path = `${id}/avatar.${ext}`
  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  // Delete old avatar first (ignore errors)
  await db.storage.from('avatars').remove([`${id}/avatar.jpg`, `${id}/avatar.jpeg`, `${id}/avatar.png`, `${id}/avatar.webp`, `${id}/avatar.gif`])

  const { error: uploadError } = await db.storage
    .from('avatars')
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: { publicUrl } } = db.storage.from('avatars').getPublicUrl(path)

  // Add cache-busting timestamp
  const url = `${publicUrl}?t=${Date.now()}`

  const { error: dbError } = await db.from('users').update({ profile_picture_url: url }).eq('id', id)
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  return NextResponse.json({ url })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht eingeloggt.' }, { status: 401 })

  const { id } = await params

  if (session.userId !== id && session.role !== 'admin') {
    return NextResponse.json({ error: 'Kein Zugriff.' }, { status: 403 })
  }

  // Remove all possible extensions
  await db.storage.from('avatars').remove([
    `${id}/avatar.jpg`, `${id}/avatar.jpeg`, `${id}/avatar.png`,
    `${id}/avatar.webp`, `${id}/avatar.gif`
  ])

  await db.from('users').update({ profile_picture_url: null }).eq('id', id)
  return NextResponse.json({ ok: true })
}
