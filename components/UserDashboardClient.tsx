'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { WorkshopsTab } from '@/components/WorkshopsTab'

type Tab = 'workshops' | 'reports' | 'consultations' | 'profile'

type SurveyResult = { id: string; survey_type: string; total_score: number | null; created_at: string }
type Consultation = { id: string; subject: string; message: string; reply: string | null; status: string; created_at: string }

const TYPE_LABEL: Record<string, { ar: string; color: string }> = {
  riasec: { ar: 'اكتشف ميولك',     color: '#6366f1' },
  choice: { ar: 'جاهزية الاختيار', color: '#0288d1' },
  career: { ar: 'المسار المهني',   color: '#16a34a' },
}

const NAV: { key: Tab; label: string; short: string; icon: string }[] = [
  { key: 'workshops',     label: 'الدورات',       short: 'الدورات',    icon: '📚' },
  { key: 'reports',       label: 'تقاريري',       short: 'تقاريري',    icon: '📊' },
  { key: 'consultations', label: 'الاستشارات',    short: 'استشاراتي',  icon: '💬' },
  { key: 'profile',       label: 'الملف الشخصي',  short: 'ملفي',       icon: '👤' },
]

export function UserDashboardClient() {
  const router = useRouter()
  const [user, setUser]   = useState<User | null>(null)
  const [tab, setTab]     = useState<Tab>('workshops')
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  const [name, setName]   = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  const [reports, setReports]             = useState<SurveyResult[]>([])
  const [consultations, setConsultations] = useState<Consultation[]>([])

  const [newPassword, setNewPassword]       = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwSaving, setPwSaving]             = useState(false)
  const [pwMsg, setPwMsg]                   = useState<{ ok: boolean; text: string } | null>(null)

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

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 6) { setPwMsg({ ok: false, text: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }); return }
    if (newPassword !== confirmPassword) { setPwMsg({ ok: false, text: 'كلمتا المرور غير متطابقتين' }); return }
    setPwSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPwSaving(false)
    if (error) { setPwMsg({ ok: false, text: `حدث خطأ: ${error.message}` }); return }
    setPwMsg({ ok: true, text: '✓ تم تغيير كلمة المرور بنجاح' })
    setNewPassword(''); setConfirmPassword('')
    setTimeout(() => setPwMsg(null), 4000)
  }

  async function sendConsultation(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSending(true)
    await supabase.from('consultations').insert({ user_id: user.id, user_email: user.email, user_name: user.user_metadata?.name ?? '', subject, message })
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
  const initial = displayName[0]?.toUpperCase() ?? '?'
  const reportsLabel = `تقاريري${reports.length > 0 ? ` (${reports.length})` : ''}`

  // ── Tab content sections ────────────────────────────────────────────────────
  function TabContent() {
    return (
      <>
        {tab === 'workshops' && user && <WorkshopsTab user={user} />}

        {tab === 'reports' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{reportsLabel}</h2>
              {reports.length > 0 && (
                <Link href="/my-reports" style={{ fontSize: '0.82rem', color: '#1e5fdc', textDecoration: 'none', fontWeight: 600 }}>عرض الكل ←</Link>
              )}
            </div>
            {reports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 24px', background: 'white', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📋</div>
                <p style={{ color: '#64748b', marginBottom: 20, fontSize: '0.9rem' }}>لم تُكمل أي اختبار بعد</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'right' }}>
                  {[
                    { href: '/interests',            icon: '🎯', label: 'اكتشف ميولك المهنية' },
                    { href: '/assessment/choice',    icon: '⚖️', label: 'جاهزية الاختيار' },
                    { href: '/assessment/adapt',     icon: '🔄', label: 'التكيّف المهني' },
                    { href: '/assessment/role',      icon: '🧩', label: 'الدور المهني' },
                    { href: '/assessment/effective', icon: '⚡', label: 'الكفاءة المهنية' },
                    { href: '/assessment/esteem',    icon: '🌟', label: 'التقدير الذاتي' },
                    { href: '/assessment/retire',    icon: '🕊️', label: 'التقاعد' },
                  ].map(({ href, icon, label }) => (
                    <Link key={href} href={href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, textDecoration: 'none', color: '#1e40af', fontWeight: 600, fontSize: '0.85rem' }}>
                      <span>{icon}</span><span>{label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {reports.slice(0, 5).map(r => {
                  const meta = TYPE_LABEL[r.survey_type]
                  return (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', borderRight: `3px solid ${meta?.color ?? '#94a3b8'}` }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>{meta?.ar ?? r.survey_type}</div>
                        <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 2 }}>{new Date(r.created_at).toLocaleDateString('ar-SA')}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {r.total_score != null && (
                          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: meta?.color }}>{Math.round(r.total_score)}%</span>
                        )}
                        <Link href={`/my-report/${r.id}`} style={{ fontSize: '0.8rem', color: '#1e5fdc', textDecoration: 'none', fontWeight: 600, background: '#eff6ff', padding: '4px 12px', borderRadius: 8 }}>عرض</Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'consultations' && (
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>الاستشارات المهنية</h2>
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: '20px', marginBottom: 16 }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>إرسال استشارة جديدة</h3>
              <form onSubmit={sendConsultation} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="form-field">
                  <label>الموضوع</label>
                  <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="موضوع استشارتك" required />
                </div>
                <div className="form-field">
                  <label>رسالتك</label>
                  <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} required
                    placeholder="اكتب استشارتك بالتفصيل..."
                    style={{ border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: '0.88rem', resize: 'vertical', fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                </div>
                {sent && <p style={{ color: '#16a34a', fontSize: '0.85rem', margin: 0 }}>✓ تم الإرسال بنجاح</p>}
                <button className="btn-primary" type="submit" disabled={sending} style={{ alignSelf: 'flex-start' }}>
                  {sending ? 'جارِ الإرسال...' : 'إرسال الاستشارة'}
                </button>
              </form>
            </div>
            {consultations.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', marginTop: 20 }}>لا توجد استشارات بعد</p>
            ) : consultations.map(c => (
              <div key={c.id} style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', borderRight: `3px solid ${c.status === 'replied' ? '#16a34a' : '#e2e8f0'}`, padding: '14px 18px', marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>{c.subject}</span>
                  <span style={{ fontSize: '0.7rem', padding: '3px 10px', borderRadius: 99, background: c.status === 'replied' ? '#dcfce7' : '#f1f5f9', color: c.status === 'replied' ? '#16a34a' : '#64748b', fontWeight: 600, flexShrink: 0 }}>
                    {c.status === 'replied' ? '✓ تم الرد' : 'قيد المراجعة'}
                  </span>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#475569', margin: '0 0 8px', lineHeight: 1.6 }}>{c.message}</p>
                {c.reply && (
                  <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '10px 14px', fontSize: '0.84rem', color: '#166534', borderRight: '3px solid #16a34a', marginTop: 8 }}>
                    <strong style={{ display: 'block', marginBottom: 4, fontSize: '0.78rem' }}>رد الفريق:</strong>
                    {c.reply}
                  </div>
                )}
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 8 }}>
                  {new Date(c.created_at).toLocaleDateString('ar-SA')}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'profile' && (
          <div>
            {/* Avatar card */}
            <div style={{ background: 'linear-gradient(135deg, #1e5fdc 0%, #6366f1 100%)', borderRadius: 20, padding: '24px', marginBottom: 20, color: 'white', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, flexShrink: 0 }}>
                {initial}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 2 }}>{displayName}</div>
                <div style={{ fontSize: '0.78rem', opacity: 0.75, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: '20px', marginBottom: 16 }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>تعديل الملف الشخصي</h3>
              <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 400 }}>
                <div className="form-field">
                  <label>الاسم الكامل</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="اسمك الكامل" />
                </div>
                <div className="form-field">
                  <label>رقم الهاتف</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+974 xxxx xxxx" dir="ltr" />
                </div>
                <div className="form-field">
                  <label style={{ color: '#94a3b8' }}>البريد الإلكتروني</label>
                  <input value={user?.email ?? ''} disabled style={{ background: '#f8fafc', color: '#94a3b8' }} dir="ltr" />
                </div>
                {saved && <p style={{ color: '#16a34a', fontSize: '0.85rem', margin: 0 }}>✓ تم الحفظ بنجاح</p>}
                <button className="btn-primary" type="submit" disabled={saving} style={{ alignSelf: 'flex-start' }}>
                  {saving ? 'جارِ الحفظ...' : 'حفظ التعديلات'}
                </button>
              </form>
            </div>

            {/* Change password */}
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: '20px', marginBottom: 16 }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>تغيير كلمة المرور</h3>
              <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 400 }}>
                <div className="form-field">
                  <label>كلمة المرور الجديدة</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    placeholder="6 أحرف على الأقل" required dir="ltr" />
                </div>
                <div className="form-field">
                  <label>تأكيد كلمة المرور</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="أعد كتابة كلمة المرور" required dir="ltr" />
                </div>
                {pwMsg && (
                  <p style={{ fontSize: '0.85rem', margin: 0, color: pwMsg.ok ? '#16a34a' : '#ef4444' }}>{pwMsg.text}</p>
                )}
                <button className="btn-primary" type="submit" disabled={pwSaving} style={{ alignSelf: 'flex-start' }}>
                  {pwSaving ? 'جارِ الحفظ...' : 'تغيير كلمة المرور'}
                </button>
              </form>
            </div>

            {/* Quick links — assessments */}
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: '16px 20px', marginBottom: 16 }}>
              <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>التقييمات المهنية</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { href: '/interests',            icon: '🎯', label: 'اكتشف ميولك المهنية',   sub: 'اختبار RIASEC — 24 سؤال' },
                  { href: '/assessment/choice',    icon: '⚖️', label: 'جاهزية الاختيار المهني', sub: 'هل أنت مستعد لاتخاذ القرار؟' },
                  { href: '/assessment/adapt',     icon: '🔄', label: 'التكيّف المهني',         sub: 'قدرتك على التأقلم مع التغيير' },
                  { href: '/assessment/role',      icon: '🧩', label: 'الدور المهني',           sub: 'اكتشف دورك في بيئة العمل' },
                  { href: '/assessment/effective', icon: '⚡', label: 'الكفاءة المهنية',        sub: 'قياس فاعليتك وإنتاجيتك' },
                  { href: '/assessment/esteem',    icon: '🌟', label: 'التقدير الذاتي',         sub: 'مستوى ثقتك بنفسك مهنياً' },
                  { href: '/assessment/retire',    icon: '🕊️', label: 'التقاعد',               sub: 'جاهزيتك للمرحلة القادمة' },
                ].map(({ href, icon, label, sub }) => (
                  <Link key={href} href={href} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, textDecoration: 'none' }}>
                    <span style={{ fontSize: '1.2rem' }}>{icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e40af' }}>{label}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 1 }}>{sub}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit', width: '100%', textAlign: 'right' }}>
              <span style={{ fontSize: '1.2rem' }}>🚪</span>
              <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#be123c' }}>تسجيل الخروج</span>
            </button>
          </div>
        )}
      </>
    )
  }

  // ── Mobile ──────────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: '#f8fafc' }}>
        <main style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 84px' }}>
          <TabContent />
        </main>

        {/* iOS-style bottom tab bar */}
        <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)', boxShadow: '0 -1px 0 #e2e8f0', display: 'flex', zIndex: 50, paddingBottom: 'env(safe-area-inset-bottom, 6px)' }}>
          {NAV.map(({ key, short, icon }) => {
            const active = tab === key
            return (
              <button key={key} onClick={() => setTab(key as Tab)}
                style={{ flex: 1, padding: '8px 4px 4px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{ width: 40, height: 28, borderRadius: 8, background: active ? '#eff6ff' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}>
                  <span style={{ fontSize: '1.15rem', lineHeight: 1 }}>{icon}</span>
                </div>
                <span style={{ fontSize: '0.6rem', fontWeight: 600, color: active ? '#1e5fdc' : '#94a3b8', transition: 'color 0.15s' }}>{short}</span>
              </button>
            )
          })}
        </nav>
      </div>
    )
  }

  // ── Desktop ─────────────────────────────────────────────────────────────────
  return (
    <div dir="rtl" style={{ display: 'flex', height: '100dvh', overflow: 'hidden', background: '#f8fafc' }}>

      {/* Sidebar */}
      <aside style={{ width: 240, background: '#0f172a', display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden', flexShrink: 0 }}>

        {/* Avatar header */}
        <div style={{ padding: '28px 20px 20px', borderBottom: '1px solid #1e293b', flexShrink: 0 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #1e5fdc, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: 800, color: 'white', marginBottom: 12 }}>
            {initial}
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</div>
          <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px' }}>
          {NAV.map(({ key, label, icon }) => {
            const active = tab === key
            return (
              <button key={key} onClick={() => setTab(key as Tab)}
                style={{ width: '100%', textAlign: 'right', padding: '10px 14px', marginBottom: 2, background: active ? 'rgba(96,165,250,0.1)' : 'transparent', color: active ? '#60a5fa' : '#64748b', border: `1px solid ${active ? 'rgba(96,165,250,0.2)' : 'transparent'}`, cursor: 'pointer', fontSize: '0.86rem', fontWeight: active ? 600 : 400, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.15s' }}>
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>{icon}</span>
                <span>{key === 'reports' ? reportsLabel : label}</span>
              </button>
            )
          })}

          <div style={{ marginTop: 20, padding: '16px 14px 0', borderTop: '1px solid #1e293b' }}>
            <p style={{ fontSize: '0.68rem', color: '#334155', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>التقييمات</p>
            {[
              { href: '/interests',           icon: '🎯', label: 'اكتشف ميولك' },
              { href: '/assessment/choice',   icon: '⚖️', label: 'جاهزية الاختيار' },
              { href: '/assessment/adapt',    icon: '🔄', label: 'التكيّف المهني' },
              { href: '/assessment/role',     icon: '🧩', label: 'الدور المهني' },
              { href: '/assessment/effective',icon: '⚡', label: 'الكفاءة المهنية' },
              { href: '/assessment/esteem',   icon: '🌟', label: 'التقدير الذاتي' },
              { href: '/assessment/retire',   icon: '🕊️', label: 'التقاعد' },
            ].map(({ href, icon, label }) => (
              <Link key={href} href={href} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#38bdf8', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 500, padding: '5px 0' }}>
                <span>{icon}</span> <span>{label}</span>
              </Link>
            ))}
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#475569', fontSize: '0.82rem', textDecoration: 'none', marginTop: 10, padding: '4px 0' }}>
              🏠 <span>الرئيسية</span>
            </Link>
          </div>
        </nav>

        <button onClick={logout} style={{ margin: '0 12px 20px', padding: '10px 14px', background: 'rgba(127,29,29,0.5)', color: '#fca5a5', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 10, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          🚪 <span>تسجيل الخروج</span>
        </button>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '32px 32px 32px 24px', maxWidth: 820 }}>
        <TabContent />
      </main>
    </div>
  )
}
