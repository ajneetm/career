import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean)
const APP_URL      = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const FROM_EMAIL   = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

async function sendEmail(to: string | string[], subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  }).catch(() => {})
}

export async function POST(req: NextRequest) {
  const { userId, name, email } = await req.json()
  if (!userId || !email) return NextResponse.json({ error: 'missing fields' }, { status: 400 })

  // Admin emails skip approval — just confirm and go
  if (ADMIN_EMAILS.includes(email.toLowerCase())) {
    await supabaseAdmin.auth.admin.updateUserById(userId, { email_confirm: true })
    return NextResponse.json({ ok: true, skip: true })
  }

  // Ban immediately
  const { error: banErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    ban_duration: '876000h',
  })
  if (banErr) return NextResponse.json({ error: banErr.message }, { status: 500 })

  // Record in approvals table
  await supabaseAdmin.from('user_approvals').insert({ user_id: userId, user_name: name, user_email: email })

  const displayName = name ?? email

  // Email to user — confirms their email address is reachable
  sendEmail(email, 'طلبك قيد المراجعة — Career For Everyone', `
    <div dir="rtl" style="font-family:sans-serif;max-width:480px;margin:auto;color:#0f172a">
      <h2 style="color:#1e5fdc">مرحباً ${displayName} 👋</h2>
      <p>استلمنا طلب إنشاء حسابك في منصة <strong>Career For Everyone</strong>.</p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin:20px 0">
        <p style="margin:0;color:#166534">✅ طلبك وصل وهو قيد المراجعة من قِبل الإدارة.<br/>سيصلك إيميل فور الموافقة على حسابك.</p>
      </div>
      <p style="color:#64748b;font-size:0.85rem">إذا لم تطلب هذا التسجيل، تجاهل هذا الإيميل.</p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
      <p style="color:#94a3b8;font-size:0.78rem">Career For Everyone</p>
    </div>`)

  // Email to admin
  sendEmail(ADMIN_EMAILS, `طلب تسجيل جديد: ${displayName}`, `
    <div dir="rtl" style="font-family:sans-serif;max-width:500px;margin:auto">
      <h2 style="color:#0f172a">طلب تسجيل جديد 🔐</h2>
      <table style="border-collapse:collapse;width:100%;margin:16px 0">
        <tr><td style="padding:8px;background:#f8fafc;font-weight:600">الاسم</td><td style="padding:8px">${displayName}</td></tr>
        <tr><td style="padding:8px;background:#f8fafc;font-weight:600">البريد</td><td style="padding:8px">${email}</td></tr>
      </table>
      <a href="${APP_URL}/admin" style="display:inline-block;background:#1e5fdc;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700">
        فتح لوحة الإدارة للموافقة
      </a>
    </div>`)

  return NextResponse.json({ ok: true })
}
