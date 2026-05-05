import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { workshop_id, user_id, user_email } = await req.json()
  if (!workshop_id || !user_id) return NextResponse.json({ error: 'missing fields' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('workshop_enrollments')
    .insert({ workshop_id, user_id, user_email })

  if (error && error.code !== '23505') // ignore unique violation (already enrolled)
    return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
