import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht eingeloggt.' }, { status: 401 })

  // Admins see all polls, others only visible ones
  let query = db.from('polls').select('*').order('created_at', { ascending: false })
  if (session.role !== 'admin') {
    query = query.eq('is_visible', true)
  }
  const { data: polls, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (!polls || polls.length === 0) return NextResponse.json({ polls: [] })

  const pollIds = polls.map((p) => p.id)

  const [{ data: options }, { data: votes }, { data: myVotes }] = await Promise.all([
    db.from('poll_options').select('*').in('poll_id', pollIds).order('position'),
    db.from('poll_votes').select('option_id, poll_id').in('poll_id', pollIds),
    db.from('poll_votes').select('poll_id, option_id').eq('user_id', session.userId).in('poll_id', pollIds),
  ])

  const myVoteMap: Record<string, string> = {}
  for (const v of myVotes ?? []) myVoteMap[v.poll_id] = v.option_id

  const result = polls.map((poll) => {
    const pollOptions = (options ?? []).filter((o) => o.poll_id === poll.id)
    const pollVotes = (votes ?? []).filter((v) => v.poll_id === poll.id)
    const totalVotes = pollVotes.length

    return {
      ...poll,
      options: pollOptions.map((opt) => ({
        id: opt.id,
        text: opt.text,
        position: opt.position,
        votes: pollVotes.filter((v) => v.option_id === opt.id).length,
      })),
      total_votes: totalVotes,
      my_vote: myVoteMap[poll.id] ?? null,
    }
  })

  return NextResponse.json({ polls: result })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Kein Zugriff.' }, { status: 403 })
  }

  const { question, options, is_anonymous, is_visible } = await req.json()

  if (!question?.trim()) return NextResponse.json({ error: 'Frage fehlt.' }, { status: 400 })
  if (!Array.isArray(options) || options.length < 2) {
    return NextResponse.json({ error: 'Mindestens 2 Antwortmöglichkeiten benötigt.' }, { status: 400 })
  }

  const { data: poll, error: pollError } = await db
    .from('polls')
    .insert({ question: question.trim(), is_anonymous: is_anonymous ?? true, is_visible: is_visible ?? true, created_by: session.userId })
    .select()
    .single()

  if (pollError || !poll) return NextResponse.json({ error: pollError?.message }, { status: 500 })

  const optionRows = options
    .filter((o: string) => o?.trim())
    .map((o: string, i: number) => ({ poll_id: poll.id, text: o.trim(), position: i }))

  const { error: optError } = await db.from('poll_options').insert(optionRows)
  if (optError) return NextResponse.json({ error: optError.message }, { status: 500 })

  return NextResponse.json({ poll })
}
