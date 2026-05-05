import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { profession_id, session_id, q1, q2, q3, q4, q5, q6 } = await req.json()
  if (!profession_id || !session_id) return NextResponse.json({ error: 'missing fields' }, { status: 400 })

  // check if already voted
  const { data: existing } = await supabaseAdmin
    .from('strange_profession_votes')
    .select('id')
    .eq('profession_id', profession_id)
    .eq('session_id', session_id)
    .maybeSingle()

  if (existing) return NextResponse.json({ error: 'already_voted' }, { status: 409 })

  const avg_score = ((q1 + q2 + q3 + q4 + q5 + q6) / 6)
  const { error } = await supabaseAdmin
    .from('strange_profession_votes')
    .insert({ profession_id, session_id, q1, q2, q3, q4, q5, q6, avg_score })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
