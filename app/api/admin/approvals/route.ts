import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

const APP_URL    = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  }).catch(() => {})
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('user_approvals')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const { id, userId, action, userEmail, userName } = await req.json()
  if (!id || !userId || !action) return NextResponse.json({ error: 'missing fields' }, { status: 400 })

  if (action === 'approve') {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      ban_duration: 'none',
      email_confirm: true,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await supabaseAdmin.from('user_approvals').update({ status: 'approved' }).eq('id', id)

    // Notify user their account is approved
    if (userEmail) {
      sendEmail(userEmail, 'تمت الموافقة على حسابك ✅ — Career For Everyone', `
        <div dir="rtl" style="font-family:sans-serif;max-width:480px;margin:auto;color:#0f172a">
          <h2 style="color:#16a34a">تمت الموافقة على حسابك! 🎉</h2>
          <p>مرحباً ${userName ?? userEmail}،</p>
          <p>يسعدنا إخبارك بأن طلب إنشاء حسابك في <strong>Career For Everyone</strong> تمت الموافقة عليه.</p>
          <p>يمكنك الآن تسجيل الدخول والبدء برحلتك المهنية:</p>
          <a href="${APP_URL}/login" style="display:inline-block;background:#1e5fdc;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:1rem;margin:16px 0">
            تسجيل الدخول الآن
          </a>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
          <p style="color:#94a3b8;font-size:0.78rem">Career For Everyone</p>
        </div>`)
    }

    return NextResponse.json({ ok: true })
  }

  if (action === 'reject') {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await supabaseAdmin.from('user_approvals').update({ status: 'rejected' }).eq('id', id)
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'invalid action' }, { status: 400 })
}
