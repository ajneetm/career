import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { user_id, user_name, trainer_rating, interaction_rating, content_rating, facilities_rating, benefit_rating, comments } = body

  if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('workshop_evaluations')
    .insert({ user_id, user_name, trainer_rating, interaction_rating, content_rating, facilities_rating, benefit_rating, comments })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
