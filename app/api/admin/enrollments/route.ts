import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { workshop_id, user_email } = await req.json()

  // Resolve user_id directly from auth so enrollment is visible regardless of signup method
  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
  const match = users.find(u => u.email?.toLowerCase() === user_email?.toLowerCase())
  const user_id = match?.id ?? null

  const { error } = await supabaseAdmin
    .from('workshop_enrollments')
    .insert({ workshop_id, user_email, ...(user_id ? { user_id } : {}) })
  if (error && error.code !== '23505') return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest) {
  const { id, cert_url } = await req.json()
  const { error } = await supabaseAdmin.from('workshop_enrollments').update({ cert_url }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const { error } = await supabaseAdmin.from('workshop_enrollments').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
