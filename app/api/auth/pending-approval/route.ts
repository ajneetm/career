import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean)

async function sendAdminEmail(name: string, email: string) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return

  const adminUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
      to: ADMIN_EMAILS,
      subject: `طلب تسجيل جديد: ${name}`,
      html: `
        <div dir="rtl" style="font-family:sans-serif;max-width:500px;margin:auto">
          <h2 style="color:#0f172a">طلب تسجيل جديد 🔐</h2>
          <p>يريد المستخدم التالي إنشاء حساب في المنصة:</p>
          <table style="border-collapse:collapse;width:100%;margin:16px 0">
            <tr><td style="padding:8px;background:#f8fafc;font-weight:600">الاسم</td><td style="padding:8px">${name}</td></tr>
            <tr><td style="padding:8px;background:#f8fafc;font-weight:600">البريد</td><td style="padding:8px">${email}</td></tr>
          </table>
          <a href="${adminUrl}/admin" style="display:inline-block;background:#1e5fdc;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700">
            فتح لوحة الإدارة للموافقة
          </a>
          <p style="color:#94a3b8;font-size:0.8rem;margin-top:24px">Career For Everyone Admin</p>
        </div>`,
    }),
  }).catch(() => {}) // fire and forget — don't block response
}

export async function POST(req: NextRequest) {
  const { userId, name, email } = await req.json()
  if (!userId || !email) return NextResponse.json({ error: 'missing fields' }, { status: 400 })

  // Ban the user immediately (prevents login until admin approves)
  const { error: banErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    ban_duration: '876000h',
  })
  if (banErr) return NextResponse.json({ error: banErr.message }, { status: 500 })

  // Record in approvals table
  await supabaseAdmin.from('user_approvals').insert({ user_id: userId, user_name: name, user_email: email })

  // Notify admin — async, don't await
  sendAdminEmail(name ?? email, email)

  return NextResponse.json({ ok: true })
}
