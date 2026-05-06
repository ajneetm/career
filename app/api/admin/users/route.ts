import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  // Use RPC to bypass Auth Admin API limitations
  const { data, error } = await supabaseAdmin.rpc('admin_get_users')
  if (error) {
    console.error('admin_get_users error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const { email, password, name, phone } = await req.json()
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email, password,
    email_confirm: true,
    user_metadata: { name, phone },
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.user.id })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  await Promise.all([
    supabaseAdmin.from('project_evaluations').delete().eq('evaluator_id', id),
    supabaseAdmin.from('survey_results').delete().eq('user_id', id),
    supabaseAdmin.from('workshop_enrollments').delete().eq('user_id', id),
    supabaseAdmin.from('workshop_evaluations').delete().eq('user_id', id),
    supabaseAdmin.from('consultations').delete().eq('user_id', id),
  ])
  await supabaseAdmin.from('projects').delete().eq('owner_id', id)
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
