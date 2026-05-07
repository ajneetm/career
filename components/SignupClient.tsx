'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

export function SignupClient() {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [sent, setSent]         = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role: 'user' } },
    })

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already been registered'))
        setError('هذا البريد مسجّل مسبقاً، سجّل دخولك')
      else if (error.message.includes('rate limit') || error.message.includes('Email rate'))
        setError('طلبات كثيرة، انتظر دقيقة وحاول مجدداً')
      else
        setError(`حدث خطأ: ${error.message}`)
      setLoading(false)
      return
    }

    // No session = email confirmation required
    if (!data.session) {
      setSentEmail(email)
      setSent(true)
      setLoading(false)
      return
    }

    window.location.href = '/user'
  }

  if (sent) {
    return (
      <div className="assessment-page" dir="rtl" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ width: '100%', maxWidth: 440, padding: '0 20px' }}>
          <div className="assessment-card" style={{ textAlign: 'center' }}>

            <div style={{ fontSize: '4rem', marginBottom: 16 }}>📬</div>

            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>
              تم تسجيل حسابك بنجاح!
            </h1>

            <p style={{ fontSize: '0.95rem', color: '#475569', marginBottom: 8 }}>
              أرسلنا رسالة تأكيد إلى:
            </p>
            <p style={{ fontWeight: 700, color: '#1e5fdc', fontSize: '1rem', marginBottom: 24, direction: 'ltr' }}>
              {sentEmail}
            </p>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '16px 20px', textAlign: 'right', marginBottom: 24 }}>
              <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: 8, fontWeight: 600 }}>خطوات التفعيل:</p>
              <ol style={{ fontSize: '0.85rem', color: '#64748b', paddingRight: 20, margin: 0, lineHeight: 2 }}>
                <li>افتح بريدك الإلكتروني</li>
                <li>ابحث عن رسالة من Career For Everyone</li>
                <li>اضغط على رابط التأكيد</li>
                <li>سجّل دخولك وابدأ رحلتك المهنية</li>
              </ol>
            </div>

            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 16px', marginBottom: 24, textAlign: 'right' }}>
              <p style={{ fontSize: '0.83rem', color: '#92400e', margin: 0 }}>
                💡 لم تجد الرسالة؟ تحقق من مجلد <strong>Spam</strong> أو <strong>Junk</strong>
              </p>
            </div>

            <Link href="/login" style={{ display: 'block', padding: '13px', background: '#1e5fdc', color: 'white', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem' }}>
              الذهاب لتسجيل الدخول
            </Link>

          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="assessment-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '0 20px' }}>

        <div className="assessment-card">
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>إنشاء حساب</h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 24 }}>ابدأ رحلتك المهنية اليوم</p>

          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-field">
              <label>الاسم الكامل</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="أحمد محمد" required />
            </div>

            <div className="form-field">
              <label>البريد الإلكتروني</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@email.com" required dir="ltr" />
            </div>

            <div className="form-field">
              <label>كلمة المرور</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="6 أحرف على الأقل" required dir="ltr" />
            </div>

            {error && <p className="error-msg">{error}</p>}

            <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'جارِ إنشاء الحساب...' : 'إنشاء الحساب'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.85rem', color: '#64748b' }}>
            عندك حساب؟{' '}
            <Link href="/login" style={{ color: '#1e5fdc', fontWeight: 600 }}>سجّل دخولك</Link>
          </p>
        </div>

      </div>
    </div>
  )
}
