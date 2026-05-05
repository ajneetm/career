'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

type Tab = 'results' | 'consultations'

type SurveyResult = {
  id: string
  survey_type: string
  total_score: number | null
  modal_scores: Record<string, number> | null
  language: string
  created_at: string
}

type Consultation = {
  id: string
  subject: string
  message: string
  reply: string | null
  status: string
  created_at: string
}

const TYPE_LABEL: Record<string, string> = {
  riasec: 'اكتشف ميولك',
  choice: 'جاهزية الاختيار',
  career: 'المسار المهني',
}

export function UserDashboardClient() {
  const router = useRouter()
  const [user, setUser]                   = useState<User | null>(null)
  const [tab, setTab]                     = useState<Tab>('results')
  const [results, setResults]             = useState<SurveyResult[]>([])
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [subject, setSubject]             = useState('')
  const [message, setMessage]             = useState('')
  const [sending, setSending]             = useState(false)
  const [sent, setSent]                   = useState(false)
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUser(data.user)
      fetchResults(data.user.id)
      fetchConsultations(data.user.id)
      setLoading(false)
    })
  }, [router])

  async function fetchResults(uid: string) {
    const { data } = await supabase
      .from('survey_results')
      .select('id, survey_type, total_score, modal_scores, language, created_at')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
    setResults(data ?? [])
  }

  async function fetchConsultations(uid: string) {
    const { data } = await supabase
      .from('consultations')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
    setConsultations(data ?? [])
  }

  async function sendConsultation(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSending(true)

    await supabase.from('consultations').insert({
      user_id: user.id,
      user_email: user.email,
      user_name: user.user_metadata?.name ?? '',
      subject,
      message,
    })

    setSending(false)
    setSent(true)
    setSubject('')
    setMessage('')
    fetchConsultations(user.id)
    setTimeout(() => setSent(false), 3000)
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="spinner" />
    </div>
  )

  const name = user?.user_metadata?.name ?? user?.email ?? ''

  return (
    <div dir="rtl" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>

      {/* Sidebar */}
      <aside style={{ width: 220, background: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column', padding: '32px 0', flexShrink: 0 }}>
        <div style={{ padding: '0 20px 28px', borderBottom: '1px solid #1e293b' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1e5fdc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700, marginBottom: 10 }}>
            {name[0]?.toUpperCase()}
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{name}</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>{user?.email}</div>
        </div>

        <nav style={{ flex: 1, padding: '20px 0' }}>
          {([['results', 'نتائجي'], ['consultations', 'الاستشارات']] as [Tab, string][]).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ width: '100%', textAlign: 'right', padding: '12px 20px', background: tab === t ? '#1e293b' : 'transparent', color: tab === t ? 'white' : '#94a3b8', border: 'none', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 500, borderRight: tab === t ? '3px solid #1e5fdc' : '3px solid transparent' }}>
              {label}
            </button>
          ))}

          <div style={{ margin: '16px 20px 0', borderTop: '1px solid #1e293b', paddingTop: 16 }}>
            <Link href="/interests" style={{ display: 'block', padding: '10px 0', color: '#38bdf8', fontSize: '0.84rem', textDecoration: 'none', fontWeight: 600 }}>
              + اكتشف ميولك
            </Link>
          </div>
        </nav>

        <button onClick={logout} style={{ margin: '0 20px 20px', padding: '10px', background: '#1e293b', color: '#94a3b8', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.84rem' }}>
          تسجيل الخروج
        </button>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '32px 28px', overflowY: 'auto' }}>

        {/* Results tab */}
        {tab === 'results' && (
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>نتائج اختباراتي</h2>

            {results.length === 0 ? (
              <div className="assessment-card" style={{ textAlign: 'center', padding: 40 }}>
                <p style={{ color: '#64748b', marginBottom: 16 }}>لم تُكمل أي اختبار بعد</p>
                <Link href="/interests" className="btn-primary">ابدأ اكتشف ميولك</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {results.map(r => (
                  <div key={r.id} className="assessment-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>
                        {TYPE_LABEL[r.survey_type] ?? r.survey_type}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {new Date(r.created_at).toLocaleDateString('ar-SA')}
                      </div>
                    </div>
                    {r.total_score != null && (
                      <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e5fdc' }}>
                        {Math.round(r.total_score)}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Consultations tab */}
        {tab === 'consultations' && (
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>الاستشارات المهنية</h2>

            {/* New consultation form */}
            <div className="assessment-card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 16 }}>إرسال استشارة جديدة</h3>
              <form onSubmit={sendConsultation} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="form-field">
                  <label>الموضوع</label>
                  <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="موضوع الاستشارة" required />
                </div>
                <div className="form-field">
                  <label>رسالتك</label>
                  <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
                    placeholder="اكتب استشارتك هنا..." required
                    style={{ border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: '0.9rem', resize: 'vertical', fontFamily: 'inherit' }} />
                </div>
                {sent && <p style={{ color: '#16a34a', fontSize: '0.85rem' }}>تم إرسال استشارتك بنجاح</p>}
                <button className="btn-primary" type="submit" disabled={sending} style={{ alignSelf: 'flex-start' }}>
                  {sending ? 'جارِ الإرسال...' : 'إرسال'}
                </button>
              </form>
            </div>

            {/* Consultations list */}
            {consultations.map(c => (
              <div key={c.id} className="assessment-card" style={{ marginBottom: 12, borderRight: `3px solid ${c.status === 'replied' ? '#16a34a' : '#e2e8f0'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 600 }}>{c.subject}</span>
                  <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 99, background: c.status === 'replied' ? '#dcfce7' : '#f1f5f9', color: c.status === 'replied' ? '#16a34a' : '#64748b' }}>
                    {c.status === 'replied' ? 'تم الرد' : 'قيد المراجعة'}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 8px' }}>{c.message}</p>
                {c.reply && (
                  <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '10px 14px', fontSize: '0.85rem', color: '#166534' }}>
                    <strong>رد الفريق:</strong> {c.reply}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  )
}
