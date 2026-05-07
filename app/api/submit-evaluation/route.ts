import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('workshop_evaluations').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const { error } = await supabaseAdmin.from('workshop_evaluations').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    user_id, user_name,
    trainer_rating, interaction_rating, content_rating, facilities_rating, benefit_rating,
    trainer_notes, interaction_notes, content_notes, facilities_notes, benefit_notes,
    comments,
  } = body

  if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('workshop_evaluations')
    .insert({
      user_id, user_name,
      trainer_rating, interaction_rating, content_rating, facilities_rating, benefit_rating,
      trainer_notes, interaction_notes, content_notes, facilities_notes, benefit_notes,
      comments,
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
