import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { workshop_id, workshop_title, name, phone, email } = await req.json()

  if (!workshop_title || !name || !phone) {
    return NextResponse.json({ error: 'الاسم والهاتف مطلوبان' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('workshop_registrations')
    .insert({ workshop_id: workshop_id ?? null, workshop_title, name, phone, email: email ?? null })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
