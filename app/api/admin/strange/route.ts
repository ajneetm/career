import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const workshop_id = searchParams.get('workshop_id')

  const query = supabaseAdmin
    .from('strange_professions')
    .select('*, strange_profession_votes(id, avg_score, session_id, created_at)')
    .order('created_at')

  if (workshop_id) query.eq('workshop_id', workshop_id)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const { workshop_id, name } = await req.json()
  if (!workshop_id || !name) return NextResponse.json({ error: 'missing fields' }, { status: 400 })

  // generate unique 3-digit code
  let code = ''
  for (let attempt = 0; attempt < 20; attempt++) {
    const candidate = String(Math.floor(100 + Math.random() * 900))
    const { data } = await supabaseAdmin.from('strange_professions').select('id').eq('code', candidate).maybeSingle()
    if (!data) { code = candidate; break }
  }
  if (!code) return NextResponse.json({ error: 'could not generate code' }, { status: 500 })

  const { data, error } = await supabaseAdmin
    .from('strange_professions')
    .insert({ workshop_id, name, code })
    .select('id, code')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const { id, vote_id } = await req.json()

  // delete single vote
  if (vote_id) {
    const { error } = await supabaseAdmin.from('strange_profession_votes').delete().eq('id', vote_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  // delete whole profession
  await supabaseAdmin.from('strange_profession_votes').delete().eq('profession_id', id)
  const { error } = await supabaseAdmin.from('strange_professions').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
