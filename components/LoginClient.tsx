'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase())

export function LoginClient() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const [resetMode, setResetMode]   = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent]   = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error || !data.user) {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
      setLoading(false)
      return
    }

    const isAdmin = ADMIN_EMAILS.includes(data.user.email?.toLowerCase() ?? '')
    window.location.href = isAdmin ? '/admin' : '/user'
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setResetError('')
    setResetLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setResetLoading(false)
    if (error) { setResetError(`حدث خطأ: ${error.message}`); return }
    setResetSent(true)
  }

  // ── Reset password mode ──
  if (resetMode) {
    return (
      <div className="assessment-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ width: '100%', maxWidth: 420, padding: '0 20px' }}>
          <div className="assessment-card">
            {resetSent ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>📬</div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>تم الإرسال!</h2>
                <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: 6 }}>أرسلنا رابط إعادة التعيين إلى:</p>
                <p style={{ fontWeight: 700, color: '#1e5fdc', direction: 'ltr', marginBottom: 20 }}>{resetEmail}</p>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 24 }}>تحقق من مجلد Spam إن لم يصلك</p>
                <button onClick={() => { setResetMode(false); setResetSent(false); setResetEmail('') }}
                  style={{ color: '#1e5fdc', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                  ← العودة لتسجيل الدخول
                </button>
              </div>
            ) : (
              <>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>نسيت كلمة المرور؟</h1>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 24 }}>سنرسل لك رابط لإعادة تعيينها</p>
                <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-field">
                    <label>البريد الإلكتروني</label>
                    <input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)}
                      placeholder="example@email.com" required dir="ltr" />
                  </div>
                  {resetError && <p className="error-msg">{resetError}</p>}
                  <button className="btn-primary" type="submit" disabled={resetLoading} style={{ width: '100%' }}>
                    {resetLoading ? 'جارِ الإرسال...' : 'إرسال رابط التعيين'}
                  </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.85rem' }}>
                  <button onClick={() => setResetMode(false)}
                    style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>
                    ← العودة لتسجيل الدخول
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Login mode ──
  return (
    <div className="assessment-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '0 20px' }}>
        <div className="assessment-card">
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>تسجيل الدخول</h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 24 }}>أهلاً بك في Career For Everyone</p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-field">
              <label>البريد الإلكتروني</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@email.com" required dir="ltr" />
            </div>
            <div className="form-field">
              <label>كلمة المرور</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required dir="ltr" />
            </div>

            {error && <p className="error-msg">{error}</p>}

            <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'جارِ الدخول...' : 'دخول'}
            </button>
          </form>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
              ما عندك حساب؟{' '}
              <Link href="/signup" style={{ color: '#1e5fdc', fontWeight: 600 }}>سجّل الآن</Link>
            </p>
            <button onClick={() => { setResetMode(true); setResetEmail(email) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '0.82rem' }}>
              نسيت كلمة المرور؟
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
