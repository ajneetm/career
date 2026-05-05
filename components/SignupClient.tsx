'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

export function SignupClient() {
  const router = useRouter()
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role: 'user' } },
    })

    if (error) {
      setError(error.message === 'User already registered' ? 'هذا البريد مسجّل مسبقاً' : 'حدث خطأ، حاول مرة أخرى')
      setLoading(false)
      return
    }

    router.push('/user')
    router.refresh()
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
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="أحمد محمد"
                required
              />
            </div>

            <div className="form-field">
              <label>البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                dir="ltr"
              />
            </div>

            <div className="form-field">
              <label>كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="6 أحرف على الأقل"
                required
                dir="ltr"
              />
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
