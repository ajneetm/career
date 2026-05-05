'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { WorkshopsTab } from '@/components/WorkshopsTab'

type Tab = 'profile' | 'consultations' | 'reports' | 'workshops'

type SurveyResult  = { id: string; survey_type: string; total_score: number | null; created_at: string }
type Consultation  = { id: string; subject: string; message: string; reply: string | null; status: string; created_at: string }

const TYPE_LABEL: Record<string, { ar: string; color: string }> = {
  riasec: { ar: 'اكتشف ميولك',     color: '#6366f1' },
  choice: { ar: 'جاهزية الاختيار', color: '#0288d1' },
  career: { ar: 'المسار المهني',   color: '#16a34a' },
}

const NAV: { key: Tab; label: string; short: string; icon: string }[] = [
  { key: 'profile',       label: 'الملف الشخصي', short: 'ملفي',       icon: '👤' },
  { key: 'workshops',     label: 'الدورات',       short: 'دوراتي',     icon: '📚' },
  { key: 'reports',       label: 'تقاريري',       short: 'تقاريري',    icon: '📊' },
  { key: 'consultations', label: 'الاستشارات',    short: 'استشاراتي',  icon: '💬' },
]

export function UserDashboardClient() {
  const router = useRouter()
  const [user, setUser]   = useState<User | null>(null)
  const [tab, setTab]     = useState<Tab>('profile')
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  const [name, setName]   = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  const [reports, setReports]             = useState<SurveyResult[]>([])
  const [consultations, setConsultations] = useState<Consultation[]>([])

  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent]       = useState(false)

  const loadedRef = useRef(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

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
    setSaving(false); setSaved(true)
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
  const reportsLabel = reports.length > 0 ? `تقاريري (${reports.length})` : 'تقاريري'

  // ── Tab content ────────────────────────────────────────────────────────────
  const tabContent = (
    <main style={{ flex: 1, padding: isMobile ? '20px 16px 88px' : '32px 28px', overflowY: 'auto', maxWidth: isMobile ? '100%' : 780 }}>

      {/* Profile */}
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
              {saved && <p style={{ color: '#16a34a', fontSize: '0.85rem', margin: 0 }}>تم الحفظ بنجاح ✓</p>}
              <button className="btn-primary" type="submit" disabled={saving} style={{ alignSelf: 'flex-start' }}>
                {saving ? 'جارِ الحفظ...' : 'حفظ التعديلات'}
              </button>
            </form>
          </div>

          {/* Quick links on mobile */}
          {isMobile && (
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link href="/interests" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, textDecoration: 'none', color: '#1e40af', fontWeight: 600, fontSize: '0.88rem' }}>
                🎯 اكتشف ميولك المهنية
              </Link>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, textDecoration: 'none', color: '#475569', fontSize: '0.88rem' }}>
                🏠 الصفحة الرئيسية
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Workshops */}
      {tab === 'workshops' && user && <WorkshopsTab user={user} />}

      {/* Reports */}
      {tab === 'reports' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{reportsLabel}</h2>
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
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: TYPE_LABEL[r.survey_type]?.color ?? '#94a3b8', flexShrink: 0 }} />
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

      {/* Consultations */}
      {tab === 'consultations' && (
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>الاستشارات المهنية</h2>
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
              {sent && <p style={{ color: '#16a34a', fontSize: '0.85rem', margin: 0 }}>تم الإرسال بنجاح ✓</p>}
              <button className="btn-primary" type="submit" disabled={sending} style={{ alignSelf: 'flex-start' }}>
                {sending ? 'جارِ الإرسال...' : 'إرسال'}
              </button>
            </form>
          </div>
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
  )

  // ── Mobile layout ───────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc' }}>

        {/* Mobile top header */}
        <div style={{ background: '#0f172a', color: 'white', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1e5fdc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.95rem', flexShrink: 0 }}>
              {displayName[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
            </div>
          </div>
          <button onClick={logout} style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, flexShrink: 0 }}>
            خروج
          </button>
        </div>

        {/* Content */}
        {tabContent}

        {/* Bottom tab bar */}
        <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#0f172a', display: 'flex', zIndex: 50, borderTop: '1px solid #1e293b', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          {NAV.map(({ key, short, icon }) => (
            <button key={key} onClick={() => setTab(key as Tab)}
              style={{ flex: 1, padding: '10px 4px 12px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, position: 'relative' }}>
              {/* Active indicator */}
              {tab === key && (
                <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 2, background: '#60a5fa', borderRadius: '0 0 2px 2px' }} />
              )}
              <span style={{ fontSize: '1.35rem', lineHeight: 1 }}>{icon}</span>
              <span style={{ fontSize: '0.62rem', fontWeight: 600, color: tab === key ? '#60a5fa' : '#64748b' }}>{short}</span>
            </button>
          ))}
        </nav>
      </div>
    )
  }

  // ── Desktop layout ──────────────────────────────────────────────────────────
  return (
    <div dir="rtl" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f8fafc' }}>

      {/* Sticky sidebar */}
      <aside style={{ width: 220, background: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100vh', overflow: 'hidden' }}>
        {/* Avatar */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #1e293b', flexShrink: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1e5fdc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700, marginBottom: 10 }}>
            {displayName[0]?.toUpperCase()}
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {NAV.map(({ key, label, icon }) => (
            <button key={key} onClick={() => setTab(key as Tab)}
              style={{ width: '100%', textAlign: 'right', padding: '11px 20px', background: tab === key ? '#1e293b' : 'transparent', color: tab === key ? 'white' : '#94a3b8', border: 'none', cursor: 'pointer', fontSize: '0.86rem', fontWeight: 500, borderRight: `3px solid ${tab === key ? '#1e5fdc' : 'transparent'}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1rem' }}>{icon}</span>
              {key === 'reports' ? reportsLabel : label}
            </button>
          ))}

          <div style={{ margin: '16px 20px 0', paddingTop: 14, borderTop: '1px solid #1e293b' }}>
            <Link href="/interests" style={{ display: 'block', color: '#38bdf8', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 600, padding: '6px 0' }}>
              🎯 اكتشف ميولك
            </Link>
            <Link href="/" style={{ display: 'block', color: '#64748b', fontSize: '0.82rem', textDecoration: 'none', marginTop: 8, padding: '2px 0' }}>
              🏠 الرئيسية
            </Link>
          </div>
        </nav>

        <button onClick={logout} style={{ margin: '0 16px 20px', padding: '10px', background: '#7f1d1d', color: '#fca5a5', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, flexShrink: 0 }}>
          تسجيل الخروج
        </button>
      </aside>

      {/* Scrollable main */}
      {tabContent}
    </div>
  )
}
