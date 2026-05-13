import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('user_approvals')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const { id, userId, action } = await req.json()
  if (!id || !userId || !action) return NextResponse.json({ error: 'missing fields' }, { status: 400 })

  if (action === 'approve') {
    // Unban + confirm email in one call
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      ban_duration: 'none',
      email_confirm: true,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await supabaseAdmin.from('user_approvals').update({ status: 'approved' }).eq('id', id)
    return NextResponse.json({ ok: true })
  }

  if (action === 'reject') {
    // Delete the Supabase auth user entirely
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await supabaseAdmin.from('user_approvals').update({ status: 'rejected' }).eq('id', id)
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'invalid action' }, { status: 400 })
}
