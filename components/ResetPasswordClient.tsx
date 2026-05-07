'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export function ResetPasswordClient() {
  const router = useRouter()
  const [ready, setReady]       = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [done, setDone]         = useState(false)

  useEffect(() => {
    // Supabase sets the session from the URL hash automatically
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true)
      else setError('الرابط غير صالح أو منتهي الصلاحية')
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) { setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return }
    if (password !== confirm) { setError('كلمتا المرور غير متطابقتين'); return }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password })
    setSaving(false)
    if (error) { setError(`حدث خطأ: ${error.message}`); return }
    setDone(true)
    setTimeout(() => router.push('/login'), 2500)
  }

  return (
    <div className="assessment-page" dir="rtl" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '0 20px' }}>
        <div className="assessment-card">
          {done ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>تم التغيير بنجاح!</h2>
              <p style={{ color: '#64748b', fontSize: '0.88rem' }}>سيتم توجيهك لتسجيل الدخول...</p>
            </div>
          ) : !ready ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              {error ? (
                <>
                  <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>❌</div>
                  <p style={{ color: '#ef4444', fontWeight: 600 }}>{error}</p>
                </>
              ) : (
                <div className="spinner" />
              )}
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>كلمة مرور جديدة</h1>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 24 }}>اختر كلمة مرور قوية</p>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-field">
                  <label>كلمة المرور الجديدة</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="6 أحرف على الأقل" required dir="ltr" />
                </div>
                <div className="form-field">
                  <label>تأكيد كلمة المرور</label>
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                    placeholder="أعد كتابة كلمة المرور" required dir="ltr" />
                </div>
                {error && <p className="error-msg">{error}</p>}
                <button className="btn-primary" type="submit" disabled={saving} style={{ width: '100%' }}>
                  {saving ? 'جارِ الحفظ...' : 'حفظ كلمة المرور'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
