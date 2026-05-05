'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

type Tab = 'profile' | 'consultations' | 'reports'

type SurveyResult = { id: string; survey_type: string; total_score: number | null; created_at: string }
type Consultation  = { id: string; subject: string; message: string; reply: string | null; status: string; created_at: string }

const TYPE_LABEL: Record<string, { ar: string; color: string }> = {
  riasec: { ar: 'اكتشف ميولك',     color: '#6366f1' },
  choice: { ar: 'جاهزية الاختيار', color: '#0288d1' },
  career: { ar: 'المسار المهني',   color: '#16a34a' },
}

export function UserDashboardClient() {
  const router = useRouter()
  const [user, setUser]   = useState<User | null>(null)
  const [tab, setTab]     = useState<Tab>('profile')
  const [loading, setLoading] = useState(true)

  // profile edit
  const [name, setName]   = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  // data
  const [reports, setReports]             = useState<SurveyResult[]>([])
  const [consultations, setConsultations] = useState<Consultation[]>([])

  // new consultation
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent]       = useState(false)

  const loadedRef = useRef(false)

  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true

    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUser(data.user)
      setName(data.user.user_metadata?.name ?? '')
      setPhone(data.user.user_metadata?.phone ?? '')

      Promise.all([
        supabase.from('survey_results').select('id, survey_type, total_score, created_at').eq('user_id', data.user.id).order('created_at', { ascending: false }),
        supabase.from('consultations').select('*').eq('user_id', data.user.id).order('created_at', { ascending: false }),
      ]).then(([r, c]) => {
        setReports(r.data ?? [])
        setConsultations(c.data ?? [])
        setLoading(false)
      })
    })
  }, [router])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await supabase.auth.updateUser({ data: { name, phone } })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function sendConsultation(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSending(true)
    await supabase.from('consultations').insert({
      user_id: user.id, user_email: user.email,
      user_name: user.user_metadata?.name ?? '',
      subject, message,
    })
    setSending(false); setSent(true)
    setSubject(''); setMessage('')
    const { data } = await supabase.from('consultations').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setConsultations(data ?? [])
    setTimeout(() => setSent(false), 3000)
  }

  async function logout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="spinner" />
    </div>
  )

  const displayName = user?.user_metadata?.name ?? user?.email ?? ''

  const NAV: { key: Tab; label: string }[] = [
    { key: 'profile',       label: 'الملف الشخصي' },
    { key: 'reports',       label: `تقاريري ${reports.length > 0 ? `(${reports.length})` : ''}` },
    { key: 'consultations', label: 'الاستشارات' },
  ]

  return (
    <div dir="rtl" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>

      {/* ── Sidebar ── */}
      <aside style={{ width: 220, background: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column', padding: '32px 0', flexShrink: 0 }}>
        {/* Avatar */}
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #1e293b' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1e5fdc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700, marginBottom: 10 }}>
            {displayName[0]?.toUpperCase()}
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 0' }}>
          {NAV.map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ width: '100%', textAlign: 'right', padding: '12px 20px', background: tab === key ? '#1e293b' : 'transparent', color: tab === key ? 'white' : '#94a3b8', border: 'none', cursor: 'pointer', fontSize: '0.86rem', fontWeight: 500, borderRight: `3px solid ${tab === key ? '#1e5fdc' : 'transparent'}` }}>
              {label}
            </button>
          ))}

          <div style={{ margin: '12px 20px 0', paddingTop: 12, borderTop: '1px solid #1e293b' }}>
            <Link href="/interests" style={{ display: 'block', color: '#38bdf8', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 600, padding: '6px 0' }}>
              + اكتشف ميولك
            </Link>
            <Link href="/" style={{ display: 'block', color: '#64748b', fontSize: '0.82rem', textDecoration: 'none', marginTop: 6 }}>
              الرئيسية
            </Link>
          </div>
        </nav>

        <button onClick={logout} style={{ margin: '0 16px 16px', padding: '10px', background: '#1e293b', color: '#64748b', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem' }}>
          تسجيل الخروج
        </button>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, padding: '32px 28px', overflowY: 'auto', maxWidth: 780 }}>

        {/* ─── Profile ─── */}
        {tab === 'profile' && (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>الملف الشخصي</h2>
            <div className="assessment-card">
              <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
                <div className="form-field">
                  <label>الاسم الكامل</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="اسمك الكامل" />
                </div>
                <div className="form-field">
                  <label>رقم الهاتف</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+974 xxxx xxxx" dir="ltr" />
                </div>
                <div className="form-field">
                  <label>البريد الإلكتروني</label>
                  <input value={user?.email ?? ''} disabled style={{ background: '#f8fafc', color: '#94a3b8' }} dir="ltr" />
                </div>
                {saved && <p style={{ color: '#16a34a', fontSize: '0.85rem', margin: 0 }}>تم الحفظ بنجاح</p>}
                <button className="btn-primary" type="submit" disabled={saving} style={{ alignSelf: 'flex-start' }}>
                  {saving ? 'جارِ الحفظ...' : 'حفظ التعديلات'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ─── Reports ─── */}
        {tab === 'reports' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>تقاريري</h2>
              <Link href="/my-reports" style={{ fontSize: '0.82rem', color: '#1e5fdc', textDecoration: 'none', fontWeight: 600 }}>عرض الكل ←</Link>
            </div>

            {reports.length === 0 ? (
              <div className="assessment-card" style={{ textAlign: 'center', padding: 40 }}>
                <p style={{ color: '#64748b', marginBottom: 16 }}>لم تُكمل أي اختبار بعد</p>
                <Link href="/interests" className="btn-primary">ابدأ اكتشف ميولك</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {reports.slice(0, 5).map(r => (
                  <div key={r.id} className="assessment-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: TYPE_LABEL[r.survey_type]?.color ?? '#94a3b8' }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b' }}>{TYPE_LABEL[r.survey_type]?.ar ?? r.survey_type}</div>
                        <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{new Date(r.created_at).toLocaleDateString('ar-SA')}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {r.total_score != null && <span style={{ fontWeight: 700, color: TYPE_LABEL[r.survey_type]?.color }}>{Math.round(r.total_score)}%</span>}
                      <Link href={`/my-report/${r.id}`} style={{ fontSize: '0.78rem', color: '#1e5fdc', textDecoration: 'none', fontWeight: 600 }}>عرض</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Consultations ─── */}
        {tab === 'consultations' && (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>الاستشارات المهنية</h2>

            {/* New */}
            <div className="assessment-card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 14 }}>إرسال استشارة جديدة</h3>
              <form onSubmit={sendConsultation} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="form-field">
                  <label>الموضوع</label>
                  <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="موضوع استشارتك" required />
                </div>
                <div className="form-field">
                  <label>رسالتك</label>
                  <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} required
                    placeholder="اكتب استشارتك بالتفصيل..."
                    style={{ border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: '0.9rem', resize: 'vertical', fontFamily: 'inherit', outline: 'none' }} />
                </div>
                {sent && <p style={{ color: '#16a34a', fontSize: '0.85rem', margin: 0 }}>تم الإرسال بنجاح</p>}
                <button className="btn-primary" type="submit" disabled={sending} style={{ alignSelf: 'flex-start' }}>
                  {sending ? 'جارِ الإرسال...' : 'إرسال'}
                </button>
              </form>
            </div>

            {/* List */}
            {consultations.map(c => (
              <div key={c.id} className="assessment-card" style={{ marginBottom: 10, borderRight: `3px solid ${c.status === 'replied' ? '#16a34a' : '#e2e8f0'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.subject}</span>
                  <span style={{ fontSize: '0.72rem', padding: '2px 10px', borderRadius: 99, background: c.status === 'replied' ? '#dcfce7' : '#f1f5f9', color: c.status === 'replied' ? '#16a34a' : '#64748b', fontWeight: 600 }}>
                    {c.status === 'replied' ? 'تم الرد' : 'قيد المراجعة'}
                  </span>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#475569', margin: '0 0 8px' }}>{c.message}</p>
                {c.reply && (
                  <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '10px 14px', fontSize: '0.84rem', color: '#166534', borderRight: '3px solid #16a34a' }}>
                    <strong>رد الفريق:</strong> {c.reply}
                  </div>
                )}
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 8 }}>
                  {new Date(c.created_at).toLocaleDateString('ar-SA')}
                </div>
              </div>
            ))}

            {consultations.length === 0 && (
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', marginTop: 20 }}>لا توجد استشارات بعد</p>
            )}
          </div>
        )}

      </main>
    </div>
  )
}
