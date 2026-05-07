'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase())

type AdminTab = 'overview' | 'surveys' | 'users' | 'workshops' | 'registrations' | 'consultations' | 'evaluation'

type Survey     = { id: string; name: string | null; email: string | null; survey_type: string; total_score: number | null; modal_scores: Record<string,unknown> | null; language: string; created_at: string }
type SiteUser   = { id: string; email: string; created_at: string; user_metadata: { name?: string; full_name?: string; phone?: string } }
type Workshop   = { id: string; name_ar: string; name_en: string | null; description_ar: string | null; category: string | null; duration: string | null; discount_percent: number | null; discount_code: string | null; is_active: boolean; post_assessment_open: boolean }
type Material   = { id: string; workshop_id: string; name: string; url: string; content_type: string; sort_order: number }
type Enrollment = { id: string; workshop_id: string; user_id: string | null; user_email: string | null; created_at: string }
type WsRegistration = { id: string; workshop_id: string | null; workshop_title: string; name: string; phone: string; email: string | null; created_at: string }
type Consult    = { id: string; user_email: string | null; user_name: string | null; subject: string; message: string; reply: string | null; status: string; created_at: string }
type EvalSettings = { is_open: boolean }
type WsEval     = { id: string; user_name: string | null; trainer_rating: number; interaction_rating: number; content_rating: number; facilities_rating: number; benefit_rating: number; comments: string | null; source: string | null; created_at: string }
type StrangeVote = { id: string; avg_score: number; session_id: string | null; created_at: string }
type StrangeProf = { id: string; workshop_id: string; name: string; code: string; is_active: boolean; strange_profession_votes: StrangeVote[] }

const NAV: { key: AdminTab; label: string; icon: string }[] = [
  { key: 'overview',      label: 'نظرة عامة',     icon: '📊' },
  { key: 'surveys',       label: 'الاختبارات',     icon: '📋' },
  { key: 'users',         label: 'المستخدمون',     icon: '👥' },
  { key: 'workshops',     label: 'الدورات',         icon: '🎓' },
  { key: 'registrations', label: 'التسجيلات',      icon: '📝' },
  { key: 'consultations', label: 'الاستشارات',      icon: '💬' },
  { key: 'evaluation',    label: 'تقييم الورشة',   icon: '⭐' },
]

const TYPE_AR: Record<string, string> = { riasec: 'اكتشف ميولك', choice: 'جاهزية الاختيار', career: 'المسار المهني' }

function avg(evals: WsEval[], key: keyof WsEval) {
  if (!evals.length) return 0
  const sum = evals.reduce((a, e) => a + (Number(e[key]) || 0), 0)
  return (sum / evals.length).toFixed(1)
}

function adminFetch(url: string, opts?: RequestInit) {
  return fetch(url, { ...opts, headers: { 'Content-Type': 'application/json', ...(opts?.headers ?? {}) } })
}

export function AdminDashboardClient() {
  const router = useRouter()
  const [ready, setReady]   = useState(false)
  const [tab, setTab]       = useState<AdminTab>(() => {
    if (typeof window !== 'undefined') return (localStorage.getItem('admin_tab') as AdminTab) ?? 'overview'
    return 'overview'
  })
  const [loading, setLoading] = useState(true)

  // data
  const [surveys, setSurveys]         = useState<Survey[]>([])
  const [users, setUsers]             = useState<SiteUser[]>([])
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [workshops, setWorkshops]     = useState<Workshop[]>([])
  const [materials, setMaterials]     = useState<Material[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [wsRegistrations, setWsRegistrations] = useState<WsRegistration[]>([])
  const [consults, setConsults]       = useState<Consult[]>([])
  const [evalSettings, setEvalSettings] = useState<EvalSettings>({ is_open: false })
  const [wsEvals, setWsEvals]         = useState<WsEval[]>([])
  // ui state
  const [selectedWs, setSelectedWs]       = useState<Workshop | null>(null)
  const [replyingId, setReplyingId]       = useState<string | null>(null)
  const [replyText, setReplyText]         = useState('')
  const [confirmDel, setConfirmDel]       = useState<{ type: string; id: string; label: string } | null>(null)
  const [deleting, setDeleting]           = useState(false)

  // add-workshop form
  const [wsForm, setWsForm] = useState({ name_ar: '', name_en: '', description_ar: '', category: '', duration: '', discount_percent: '', discount_code: '' })
  const [wsFormOpen, setWsFormOpen] = useState(false)
  const [wsFormSaving, setWsFormSaving] = useState(false)

  // add-material form
  const [matForm, setMatForm] = useState({ name: '', url: '', content_type: 'file' })
  const [matFormSaving, setMatFormSaving] = useState(false)

  // add-enrollment form
  const [enrEmail, setEnrEmail] = useState('')
  const [enrSaving, setEnrSaving] = useState(false)

  // strange professions
  const [strangeProfessions, setStrangeProfessions] = useState<StrangeProf[]>([])
  const [strangeName, setStrangeName] = useState('')
  const [strangeSaving, setStrangeSaving] = useState(false)
  const [wsPanel, setWsPanel] = useState<'materials' | 'enrollments' | 'strange'>('materials')
  const [expandedVotes, setExpandedVotes] = useState<string | null>(null)

  // add-user form
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '' })
  const [userFormOpen, setUserFormOpen] = useState(false)
  const [userFormSaving, setUserFormSaving] = useState(false)

  const changeTab = (t: AdminTab) => { setTab(t); localStorage.setItem('admin_tab', t) }

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [dataRes, usersRes] = await Promise.all([
        adminFetch('/api/admin/data'),
        adminFetch('/api/admin/users'),
      ])
      const data = await dataRes.json()
      const usersData = await usersRes.json()
      setSurveys(data.surveys ?? [])
      setWorkshops(data.workshops ?? [])
      setMaterials(data.materials ?? [])
      setEnrollments(data.enrollments ?? [])
      setWsRegistrations(data.wsRegistrations ?? [])
      setConsults(data.consultations ?? [])
      setEvalSettings(data.evalSettings ?? { is_open: false })
      setWsEvals(data.wsEvals ?? [])
      setUsers(Array.isArray(usersData) ? usersData : [])
    } catch (err) {
      console.error('Admin fetchAll error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user || !ADMIN_EMAILS.includes(data.user.email?.toLowerCase() ?? '')) {
        router.push('/login'); return
      }
      setReady(true)
      fetchAll()
    })
  }, [router, fetchAll])

  // ── Delete helper ──
  async function confirmDelete() {
    if (!confirmDel) return
    const { type, id } = confirmDel
    setDeleting(true)
    try {
      let ok = true
      if (type === 'survey')    { const r = await adminFetch('/api/admin/data',           { method: 'DELETE', body: JSON.stringify({ id }) }); ok = r.ok; if (ok) setSurveys(s => s.filter(x => x.id !== id)) }
      if (type === 'user')      { const r = await adminFetch('/api/admin/users',           { method: 'DELETE', body: JSON.stringify({ id }) }); ok = r.ok; if (ok) setUsers(u => u.filter(x => x.id !== id)) }
      if (type === 'workshop')  { const r = await adminFetch('/api/admin/workshops',       { method: 'DELETE', body: JSON.stringify({ id }) }); ok = r.ok; if (ok) { setWorkshops(w => w.filter(x => x.id !== id)); if (selectedWs?.id === id) setSelectedWs(null) } }
      if (type === 'material')  { const r = await adminFetch('/api/admin/materials',       { method: 'DELETE', body: JSON.stringify({ id }) }); ok = r.ok; if (ok) setMaterials(m => m.filter(x => x.id !== id)) }
      if (type === 'enrollment'){ const r = await adminFetch('/api/admin/enrollments',     { method: 'DELETE', body: JSON.stringify({ id }) }); ok = r.ok; if (ok) setEnrollments(e => e.filter(x => x.id !== id)) }
      if (type === 'consult')   { const r = await adminFetch('/api/admin/consultations',   { method: 'DELETE', body: JSON.stringify({ id }) }); ok = r.ok; if (ok) setConsults(c => c.filter(x => x.id !== id)) }
      if (type === 'wseval')    { const r = await adminFetch('/api/submit-evaluation',     { method: 'DELETE', body: JSON.stringify({ id }) }); ok = r.ok; if (ok) setWsEvals(e => e.filter(x => x.id !== id)) }
      if (!ok) alert('حدث خطأ أثناء الحذف')
    } finally {
      setDeleting(false)
      setConfirmDel(null)
    }
  }

  if (!ready) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><div className="spinner" /></div>

  const pendingConsults = consults.filter(c => c.status === 'pending').length
  const newRegistrations = wsRegistrations.length

  // ── Render ──
  return (
    <div dir="rtl" style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9', fontFamily: 'system-ui, sans-serif' }}>

      {/* Sidebar */}
      <aside style={{ width: 200, background: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ padding: '24px 16px 20px', borderBottom: '1px solid #1e293b' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748b', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>لوحة الإدارة</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white' }}>Career Admin</div>
        </div>
        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          {NAV.map(({ key, label, icon }) => (
            <button key={key} onClick={() => changeTab(key)}
              style={{ width: '100%', textAlign: 'right', padding: '11px 16px', background: tab === key ? '#1e293b' : 'transparent',
                color: tab === key ? 'white' : '#94a3b8', border: 'none', cursor: 'pointer', fontSize: '0.84rem',
                borderRight: `3px solid ${tab === key ? '#1e5fdc' : 'transparent'}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{icon}</span>
              <span>{label}</span>
              {key === 'consultations' && pendingConsults > 0 && (
                <span style={{ marginRight: 'auto', background: '#ef4444', color: 'white', fontSize: '0.68rem', borderRadius: 99, padding: '1px 6px', fontWeight: 700 }}>
                  {pendingConsults}
                </span>
              )}
              {key === 'registrations' && newRegistrations > 0 && (
                <span style={{ marginRight: 'auto', background: '#1e5fdc', color: 'white', fontSize: '0.68rem', borderRadius: 99, padding: '1px 6px', fontWeight: 700 }}>
                  {newRegistrations}
                </span>
              )}
            </button>
          ))}
        </nav>
        <button onClick={() => { supabase.auth.signOut(); window.location.href = '/' }}
          style={{ margin: '0 12px 16px', padding: '10px', background: '#7f1d1d', color: '#fca5a5', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
          تسجيل الخروج
        </button>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '28px', overflowY: 'auto', minWidth: 0 }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}><div className="spinner" /></div>
        ) : (
          <>
            {/* ── OVERVIEW ── */}
            {tab === 'overview' && (
              <div>
                <h2 style={styles.heading}>نظرة عامة</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
                  {[
                    { label: 'المستخدمون', value: users.length, color: '#6366f1' },
                    { label: 'الاختبارات', value: surveys.length, color: '#0288d1' },
                    { label: 'الدورات', value: workshops.length, color: '#16a34a' },
                    { label: 'الاستشارات', value: consults.length, color: '#f59e0b' },
                    { label: 'التقييمات', value: wsEvals.length, color: '#ef4444' },
                  ].map(s => (
                    <div key={s.label} style={{ background: 'white', borderRadius: 14, padding: '20px 18px', borderTop: `4px solid ${s.color}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                      <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={styles.card}>
                    <div style={styles.cardTitle}>الاختبارات حسب النوع</div>
                    {['riasec', 'choice', 'career'].map(t => {
                      const count = surveys.filter(s => s.survey_type === t).length
                      return <div key={t} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                        <span style={{ color: '#475569' }}>{TYPE_AR[t]}</span>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{count}</span>
                      </div>
                    })}
                  </div>
                  <div style={styles.card}>
                    <div style={styles.cardTitle}>الاستشارات حسب الحالة</div>
                    {['pending', 'replied', 'closed'].map(s => {
                      const count = consults.filter(c => c.status === s).length
                      const label = s === 'pending' ? 'قيد المراجعة' : s === 'replied' ? 'تم الرد' : 'مغلقة'
                      return <div key={s} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                        <span style={{ color: '#475569' }}>{label}</span>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{count}</span>
                      </div>
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── SURVEYS ── */}
            {tab === 'surveys' && (
              <div>
                <div style={styles.topRow}>
                  <h2 style={styles.heading}>الاختبارات ({surveys.length})</h2>
                  <button style={styles.btnSecondary} onClick={() => exportCSV(surveys)}>تصدير CSV</button>
                </div>
                <div style={styles.card}>
                  <table style={styles.table}>
                    <thead><tr>
                      {['الاسم', 'البريد', 'النوع', 'النتيجة', 'التاريخ', ''].map(h => <th key={h} style={styles.th}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {surveys.map(s => (
                        <tr key={s.id} style={styles.tr}>
                          <td style={styles.td}>{s.name ?? '—'}</td>
                          <td style={styles.td}>{s.email ?? '—'}</td>
                          <td style={styles.td}>{TYPE_AR[s.survey_type] ?? s.survey_type}</td>
                          <td style={styles.td}>{s.total_score != null ? `${Math.round(s.total_score)}%` : '—'}</td>
                          <td style={styles.td}>{new Date(s.created_at).toLocaleDateString('ar-SA')}</td>
                          <td style={styles.td}>
                            <button style={styles.btnDanger} onClick={() => setConfirmDel({ type: 'survey', id: s.id, label: `اختبار ${s.name ?? s.email}` })}>حذف</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── USERS ── */}
            {tab === 'users' && (
              <div>
                <div style={styles.topRow}>
                  <h2 style={styles.heading}>المستخدمون ({users.length})</h2>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={styles.btnSecondary} onClick={async () => {
                      if (!confirm('استيراد 36 مستخدم بكلمة مرور 123456789؟')) return
                      try {
                        const { data: { session } } = await supabase.auth.getSession()
                        const token = session?.access_token ?? ''
                        const res = await adminFetch('/api/admin/bulk-create', {
                          method: 'POST',
                          headers: { Authorization: `Bearer ${token}` },
                          body: JSON.stringify({}),
                        })
                        const json = await res.json()
                        if (json.error) { alert('خطأ: ' + json.error); return }
                        const created = (json.results ?? []).filter((r: { status: string }) => r.status === 'created').length
                        const exists  = (json.results ?? []).filter((r: { status: string }) => r.status === 'exists').length
                        const failed  = (json.results ?? []).filter((r: { status: string }) => r.status.startsWith('error')).length
                        alert(`✅ تم إنشاء ${created} مستخدم\n⚠️ موجود مسبقاً: ${exists}\n❌ فشل: ${failed}`)
                        fetchAll()
                      } catch (e: any) { alert('خطأ: ' + e.message) }
                    }}>📥 استيراد المستخدمين</button>

                    <button style={styles.btnSecondary} onClick={async () => {
                      if (!confirm('إعادة تعيين كلمات مرور المستخدمين المُضافين بالـ SQL؟')) return
                      try {
                        const { data: { session } } = await supabase.auth.getSession()
                        const token = session?.access_token ?? ''
                        const res = await adminFetch('/api/admin/reset-passwords', {
                          method: 'POST',
                          headers: { Authorization: `Bearer ${token}` },
                          body: JSON.stringify({}),
                        })
                        const json = await res.json()
                        if (json.error) { alert('خطأ: ' + json.error); return }
                        const failed = (json.results ?? []).filter((r: { status: string }) => r.status !== 'ok')
                        if (failed.length === 0) {
                          alert('✅ تم تحديث كلمات المرور بنجاح')
                        } else {
                          alert(`⚠️ فشل ${failed.length} مستخدم:\n` + failed.map((r: { email: string; status: string }) => `${r.email}: ${r.status}`).join('\n'))
                        }
                      } catch (e: any) {
                        alert('خطأ غير متوقع: ' + e.message)
                      }
                    }}>🔑 إعادة تعيين الكلمات</button>
                    <button style={styles.btnPrimary} onClick={() => setUserFormOpen(true)}>+ مستخدم جديد</button>
                  </div>
                </div>

                {userFormOpen && (
                  <div style={{ ...styles.card, marginBottom: 20 }}>
                    <div style={styles.cardTitle}>إضافة مستخدم</div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {[['name', 'الاسم'], ['email', 'البريد'], ['password', 'كلمة المرور']].map(([k, lbl]) => (
                        <input key={k} type={k === 'password' ? 'password' : 'text'} placeholder={lbl}
                          value={userForm[k as keyof typeof userForm]}
                          onChange={e => setUserForm(f => ({ ...f, [k]: e.target.value }))}
                          style={styles.input} />
                      ))}
                      <button style={styles.btnPrimary} disabled={userFormSaving} onClick={async () => {
                        setUserFormSaving(true)
                        const res = await adminFetch('/api/admin/users', { method: 'POST', body: JSON.stringify(userForm) })
                        if (res.ok) { setUserFormOpen(false); setUserForm({ name: '', email: '', password: '' }); fetchAll() }
                        setUserFormSaving(false)
                      }}>{userFormSaving ? '...' : 'إضافة'}</button>
                      <button style={styles.btnSecondary} onClick={() => setUserFormOpen(false)}>إلغاء</button>
                    </div>
                  </div>
                )}

                {selectedUsers.size > 0 && (
                  <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>تم تحديد {selectedUsers.size} مستخدم</span>
                    <button style={styles.btnDanger} onClick={async () => {
                      if (!confirm(`حذف ${selectedUsers.size} مستخدم؟`)) return
                      for (const id of selectedUsers) {
                        await adminFetch('/api/admin/users', { method: 'DELETE', body: JSON.stringify({ id }) })
                      }
                      setUsers(u => u.filter(x => !selectedUsers.has(x.id)))
                      setSelectedUsers(new Set())
                    }}>🗑 حذف المحدّدين</button>
                    <button style={styles.btnSecondary} onClick={() => setSelectedUsers(new Set())}>إلغاء التحديد</button>
                  </div>
                )}

                <div style={styles.card}>
                  <table style={styles.table}>
                    <thead><tr>
                      <th style={styles.th}>
                        <input type="checkbox"
                          checked={selectedUsers.size === users.length && users.length > 0}
                          onChange={e => setSelectedUsers(e.target.checked ? new Set(users.map(u => u.id)) : new Set())} />
                      </th>
                      {['الاسم', 'البريد', 'تاريخ التسجيل', ''].map(h => <th key={h} style={styles.th}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} style={styles.tr}>
                          <td style={styles.td}>
                            <input type="checkbox"
                              checked={selectedUsers.has(u.id)}
                              onChange={e => setSelectedUsers(prev => {
                                const next = new Set(prev)
                                e.target.checked ? next.add(u.id) : next.delete(u.id)
                                return next
                              })} />
                          </td>
                          <td style={styles.td}>
                            {u.user_metadata?.name ?? u.user_metadata?.full_name ?? '—'}
                            {ADMIN_EMAILS.includes(u.email?.toLowerCase()) && <span style={styles.badge('#6366f1')}>أدمن</span>}
                          </td>
                          <td style={styles.td}>{u.email}</td>
                          <td style={styles.td}>{new Date(u.created_at).toLocaleDateString('ar-SA')}</td>
                          <td style={styles.td}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button style={styles.btnSecondary} onClick={async () => {
                                const res = await adminFetch('/api/admin/impersonate', { method: 'POST', body: JSON.stringify({ email: u.email }) })
                                const { link } = await res.json()
                                if (link) window.open(link, '_blank')
                              }}>دخول</button>
                              <button style={styles.btnDanger} onClick={() => setConfirmDel({ type: 'user', id: u.id, label: u.email })}>حذف</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── WORKSHOPS ── */}
            {tab === 'workshops' && (
              <div style={{ display: 'flex', gap: 20 }}>
                {/* Workshop list */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={styles.topRow}>
                    <h2 style={styles.heading}>الدورات</h2>
                    <button style={styles.btnPrimary} onClick={() => setWsFormOpen(v => !v)}>+ دورة جديدة</button>
                  </div>

                  {wsFormOpen && (
                    <div style={{ ...styles.card, marginBottom: 16 }}>
                      <div style={styles.cardTitle}>إضافة دورة</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[['name_ar', 'الاسم بالعربي *'], ['name_en', 'الاسم بالانجليزي'], ['description_ar', 'الوصف'], ['category', 'الفئة'], ['duration', 'المدة'], ['discount_percent', 'الخصم %'], ['discount_code', 'كود الخصم']].map(([k, lbl]) => (
                          <input key={k} placeholder={lbl} value={wsForm[k as keyof typeof wsForm]}
                            onChange={e => setWsForm(f => ({ ...f, [k]: e.target.value }))}
                            style={styles.input} />
                        ))}
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button style={styles.btnPrimary} disabled={wsFormSaving || !wsForm.name_ar} onClick={async () => {
                            setWsFormSaving(true)
                            const res = await adminFetch('/api/admin/workshops', { method: 'POST', body: JSON.stringify({ ...wsForm, discount_percent: Number(wsForm.discount_percent) || 0 }) })
                            if (res.ok) { setWsFormOpen(false); setWsForm({ name_ar: '', name_en: '', description_ar: '', category: '', duration: '', discount_percent: '', discount_code: '' }); fetchAll() }
                            setWsFormSaving(false)
                          }}>{wsFormSaving ? '...' : 'حفظ'}</button>
                          <button style={styles.btnSecondary} onClick={() => setWsFormOpen(false)}>إلغاء</button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {workshops.map(ws => {
                      const wsEnrs = enrollments.filter(e => e.workshop_id === ws.id)
                      const wsMats = materials.filter(m => m.workshop_id === ws.id)
                      return (
                        <div key={ws.id} style={{ ...styles.card, cursor: 'pointer', borderRight: `3px solid ${selectedWs?.id === ws.id ? '#1e5fdc' : '#e2e8f0'}` }}
                          onClick={() => {
                            const next = selectedWs?.id === ws.id ? null : ws
                            setSelectedWs(next)
                            setWsPanel('materials')
                            if (next) {
                              fetch(`/api/admin/strange?workshop_id=${next.id}`)
                                .then(r => r.json()).then(setStrangeProfessions)
                            }
                          }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#1e293b' }}>{ws.name_ar}</div>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
                                {wsMats.length} مادة · {wsEnrs.length} مسجّل
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button style={styles.btnDanger} onClick={e => { e.stopPropagation(); setConfirmDel({ type: 'workshop', id: ws.id, label: ws.name_ar }) }}>حذف</button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Workshop detail panel */}
                {selectedWs && (
                  <div style={{ width: 360, flexShrink: 0 }}>
                    <div style={{ ...styles.card, position: 'sticky', top: 28 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{selectedWs.name_ar}</div>
                        <button onClick={() => setSelectedWs(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1.2rem' }}>×</button>
                      </div>

                      {/* Post assessment toggle */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: selectedWs.post_assessment_open ? '#f0fdf4' : '#f8fafc', borderRadius: 10, padding: '10px 14px', marginBottom: 14, border: `1px solid ${selectedWs.post_assessment_open ? '#bbf7d0' : '#e2e8f0'}` }}>
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>الاختبار البعدي</div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{selectedWs.post_assessment_open ? '🟢 مفتوح للمستخدمين' : '🔴 مغلق'}</div>
                        </div>
                        <button onClick={async () => {
                          const next = !selectedWs.post_assessment_open
                          await adminFetch('/api/admin/workshops', { method: 'PATCH', body: JSON.stringify({ id: selectedWs.id, post_assessment_open: next }) })
                          setSelectedWs(w => w ? { ...w, post_assessment_open: next } : w)
                          setWorkshops(ws => ws.map(w => w.id === selectedWs.id ? { ...w, post_assessment_open: next } : w))
                        }} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: 700, background: selectedWs.post_assessment_open ? '#ef4444' : '#16a34a', color: 'white' }}>
                          {selectedWs.post_assessment_open ? 'إغلاق' : 'فتح'}
                        </button>
                      </div>

                      {/* Panel tabs */}
                      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid #e2e8f0', paddingBottom: 0 }}>
                        {([['materials','المواد'], ['enrollments','المسجّلون'], ['strange','المهن الغريبة 🎭']] as const).map(([k, lbl]) => (
                          <button key={k} onClick={() => setWsPanel(k)}
                            style={{ padding: '7px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: wsPanel === k ? 700 : 400, color: wsPanel === k ? '#1e5fdc' : '#64748b', borderBottom: `2px solid ${wsPanel === k ? '#1e5fdc' : 'transparent'}`, marginBottom: -1 }}>
                            {lbl}
                          </button>
                        ))}
                      </div>

                      {/* Materials panel */}
                      {wsPanel === 'materials' && (
                        <>
                          <div style={styles.cardTitle}>المواد</div>
                          {materials.filter(m => m.workshop_id === selectedWs.id).map(m => (
                            <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.82rem' }}>
                              <span style={{ color: '#334155' }}>{m.name}</span>
                              <button style={styles.btnDanger} onClick={() => setConfirmDel({ type: 'material', id: m.id, label: m.name })}>×</button>
                            </div>
                          ))}
                          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                            <input placeholder="اسم المادة" value={matForm.name} onChange={e => setMatForm(f => ({ ...f, name: e.target.value }))} style={{ ...styles.input, flex: 1, minWidth: 100 }} />
                            <input placeholder="رابط URL" value={matForm.url} onChange={e => setMatForm(f => ({ ...f, url: e.target.value }))} style={{ ...styles.input, flex: 1, minWidth: 100 }} />
                            <select value={matForm.content_type} onChange={e => setMatForm(f => ({ ...f, content_type: e.target.value }))} style={styles.input}>
                              {['file', 'video', 'link', 'quiz'].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <button style={styles.btnPrimary} disabled={matFormSaving || !matForm.name || !matForm.url} onClick={async () => {
                              setMatFormSaving(true)
                              const res = await adminFetch('/api/admin/materials', { method: 'POST', body: JSON.stringify({ ...matForm, workshop_id: selectedWs.id }) })
                              if (res.ok) { const d = await res.json(); setMaterials(m => [...m, { ...matForm, id: d.id, workshop_id: selectedWs.id, sort_order: 0 }]); setMatForm({ name: '', url: '', content_type: 'file' }) }
                              setMatFormSaving(false)
                            }}>{matFormSaving ? '...' : 'إضافة'}</button>
                          </div>
                        </>
                      )}

                      {/* Enrollments panel */}
                      {wsPanel === 'enrollments' && (
                        <>
                          <div style={styles.cardTitle}>المسجّلون</div>
                          {enrollments.filter(e => e.workshop_id === selectedWs.id).map(e => (
                            <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.82rem' }}>
                              <span style={{ color: '#334155' }}>{e.user_email ?? '—'}</span>
                              <button style={styles.btnDanger} onClick={() => setConfirmDel({ type: 'enrollment', id: e.id, label: e.user_email ?? '' })}>×</button>
                            </div>
                          ))}
                          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                            <input placeholder="بريد المستخدم" value={enrEmail} onChange={e => setEnrEmail(e.target.value)} style={{ ...styles.input, flex: 1 }} />
                            <button style={styles.btnPrimary} disabled={enrSaving || !enrEmail} onClick={async () => {
                              setEnrSaving(true)
                              const res = await adminFetch('/api/admin/enrollments', { method: 'POST', body: JSON.stringify({ workshop_id: selectedWs.id, user_email: enrEmail }) })
                              if (res.ok) { fetchAll(); setEnrEmail('') }
                              setEnrSaving(false)
                            }}>{enrSaving ? '...' : 'تسجيل'}</button>
                          </div>
                        </>
                      )}

                      {/* Strange Professions panel */}
                      {wsPanel === 'strange' && (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <div style={styles.cardTitle}>المهن الغريبة 🎭</div>
                            <a href="/strange/results" target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e5fdc', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '5px 12px', textDecoration: 'none' }}>
                              🏆 عرض النتائج
                            </a>
                          </div>

                          {/* Sorted by avg score */}
                          {[...strangeProfessions]
                            .filter(p => p.workshop_id === selectedWs.id)
                            .sort((a, b) => {
                              const avgA = a.strange_profession_votes.length ? a.strange_profession_votes.reduce((s, v) => s + v.avg_score, 0) / a.strange_profession_votes.length : 0
                              const avgB = b.strange_profession_votes.length ? b.strange_profession_votes.reduce((s, v) => s + v.avg_score, 0) / b.strange_profession_votes.length : 0
                              return avgB - avgA
                            })
                            .map((p, idx) => {
                              const votes = p.strange_profession_votes
                              const avg = votes.length ? (votes.reduce((s, v) => s + v.avg_score, 0) / votes.length).toFixed(2) : '—'
                              const isWinner = idx === 0 && votes.length > 0
                              const link = typeof window !== 'undefined' ? `${window.location.origin}/strange/${p.code}` : `/strange/${p.code}`
                              return (
                                <div key={p.id} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        {isWinner && <span>🏆</span>}
                                        {p.name}
                                      </div>
                                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>
                                        كود: <strong style={{ color: '#1e5fdc' }}>{p.code}</strong> · {votes.length} صوت · متوسط: {avg}
                                      </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                      <button style={{ ...styles.btnSecondary, fontSize: '0.72rem', padding: '4px 8px' }}
                                        onClick={() => navigator.clipboard.writeText(link)}>نسخ</button>
                                      <button style={styles.btnDanger}
                                        onClick={() => { setStrangeProfessions(ps => ps.filter(x => x.id !== p.id)); adminFetch('/api/admin/strange', { method: 'DELETE', body: JSON.stringify({ id: p.id }) }) }}>×</button>
                                    </div>
                                  </div>
                                  {/* QR */}
                                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginTop: 8 }}>
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`}
                                      alt="QR" style={{ width: 80, height: 80, borderRadius: 8 }} />
                                    <a href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(link)}`}
                                      download={`qr-${p.code}.png`} target="_blank" rel="noopener noreferrer"
                                      style={{ ...styles.btnSecondary, fontSize: '0.72rem', padding: '4px 8px', textDecoration: 'none', display: 'inline-block' }}>
                                      ⬇ تحميل
                                    </a>
                                  </div>

                                  {/* Votes list */}
                                  {votes.length > 0 && (
                                    <div style={{ marginTop: 8 }}>
                                      <button onClick={() => setExpandedVotes(expandedVotes === p.id ? null : p.id)}
                                        style={{ fontSize: '0.72rem', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
                                        {expandedVotes === p.id ? '▲ إخفاء الأصوات' : `▼ عرض الأصوات (${votes.length})`}
                                      </button>
                                      {expandedVotes === p.id && (
                                        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                          {votes.map((v, vi) => (
                                            <div key={v.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', borderRadius: 8, padding: '6px 10px', fontSize: '0.72rem' }}>
                                              <div style={{ color: '#64748b' }}>
                                                صوت #{vi + 1}
                                                <span style={{ color: '#1e5fdc', fontWeight: 700, marginRight: 8 }}>
                                                  {v.avg_score.toFixed(1)}/5
                                                </span>
                                                <span style={{ color: '#94a3b8', marginRight: 8 }}>
                                                  {new Date(v.created_at).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                              </div>
                                              <button onClick={async () => {
                                                await adminFetch('/api/admin/strange', { method: 'DELETE', body: JSON.stringify({ vote_id: v.id }) })
                                                setStrangeProfessions(ps => ps.map(x => x.id === p.id
                                                  ? { ...x, strange_profession_votes: x.strange_profession_votes.filter(vt => vt.id !== v.id) }
                                                  : x
                                                ))
                                              }} style={{ ...styles.btnDanger, fontSize: '0.65rem', padding: '2px 6px' }}>حذف</button>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )
                            })}

                          {strangeProfessions.filter(p => p.workshop_id === selectedWs.id).length === 0 && (
                            <p style={{ color: '#94a3b8', fontSize: '0.82rem', textAlign: 'center', padding: '16px 0' }}>لا توجد مهن بعد</p>
                          )}

                          {/* Add form */}
                          <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                            <input placeholder="اسم المهنة الغريبة" value={strangeName} onChange={e => setStrangeName(e.target.value)}
                              style={{ ...styles.input, flex: 1 }} />
                            <button style={styles.btnPrimary} disabled={strangeSaving || !strangeName} onClick={async () => {
                              setStrangeSaving(true)
                              const res = await adminFetch('/api/admin/strange', { method: 'POST', body: JSON.stringify({ workshop_id: selectedWs.id, name: strangeName }) })
                              if (res.ok) {
                                const d = await res.json()
                                setStrangeProfessions(ps => [...ps, { id: d.id, workshop_id: selectedWs.id, name: strangeName, code: d.code, is_active: true, strange_profession_votes: [] }])
                                setStrangeName('')
                              }
                              setStrangeSaving(false)
                            }}>{strangeSaving ? '...' : 'إضافة'}</button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── REGISTRATIONS ── */}
            {tab === 'registrations' && (
              <div>
                <div style={styles.topRow}>
                  <h2 style={styles.heading}>طلبات التسجيل في الورش ({wsRegistrations.length})</h2>
                  <button style={styles.btnSecondary} onClick={() => exportRegistrationsCSV(wsRegistrations)}>تصدير CSV</button>
                </div>

                {wsRegistrations.length === 0 ? (
                  <div style={{ ...styles.card, textAlign: 'center', padding: 48, color: '#94a3b8' }}>
                    لا توجد طلبات تسجيل بعد
                  </div>
                ) : (
                  <div style={styles.card}>
                    <table style={styles.table}>
                      <thead><tr>
                        {['الاسم', 'الهاتف', 'البريد', 'الورشة', 'التاريخ'].map(h => <th key={h} style={styles.th}>{h}</th>)}
                      </tr></thead>
                      <tbody>
                        {wsRegistrations.map(r => (
                          <tr key={r.id} style={styles.tr}>
                            <td style={{ ...styles.td, fontWeight: 600 }}>{r.name}</td>
                            <td style={styles.td}>
                              <a href={`tel:${r.phone}`} style={{ color: '#1e5fdc', textDecoration: 'none', fontWeight: 600 }}>{r.phone}</a>
                            </td>
                            <td style={styles.td}>{r.email ?? '—'}</td>
                            <td style={styles.td}>
                              <span style={{ background: '#eff6ff', color: '#1e40af', borderRadius: 8, padding: '3px 10px', fontSize: '0.8rem', fontWeight: 600 }}>
                                {r.workshop_title}
                              </span>
                            </td>
                            <td style={{ ...styles.td, color: '#94a3b8', fontSize: '0.78rem' }}>
                              {new Date(r.created_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── CONSULTATIONS ── */}
            {tab === 'consultations' && (
              <div>
                <h2 style={styles.heading}>الاستشارات ({consults.length})</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {consults.map(c => (
                    <div key={c.id} style={{ ...styles.card, borderRight: `3px solid ${c.status === 'replied' ? '#16a34a' : c.status === 'closed' ? '#94a3b8' : '#f59e0b'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.subject}</span>
                            <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 99, background: c.status === 'replied' ? '#dcfce7' : c.status === 'closed' ? '#f1f5f9' : '#fef3c7', color: c.status === 'replied' ? '#16a34a' : c.status === 'closed' ? '#64748b' : '#92400e', fontWeight: 600 }}>
                              {c.status === 'replied' ? 'تم الرد' : c.status === 'closed' ? 'مغلقة' : 'قيد المراجعة'}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 4 }}>{c.user_name ?? c.user_email}</div>
                          <div style={{ fontSize: '0.84rem', color: '#334155' }}>{c.message}</div>
                          {c.reply && <div style={{ marginTop: 8, background: '#f0fdf4', borderRadius: 8, padding: '8px 12px', fontSize: '0.82rem', color: '#166534' }}>الرد: {c.reply}</div>}

                          {replyingId === c.id ? (
                            <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={2} placeholder="اكتب ردك..."
                                style={{ ...styles.input, flex: 1, minWidth: 200, resize: 'vertical' }} />
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button style={styles.btnPrimary} onClick={async () => {
                                  await adminFetch('/api/admin/consultations', { method: 'PATCH', body: JSON.stringify({ id: c.id, reply: replyText, status: 'replied' }) })
                                  setConsults(cs => cs.map(x => x.id === c.id ? { ...x, reply: replyText, status: 'replied' } : x))
                                  setReplyingId(null); setReplyText('')
                                }}>إرسال</button>
                                <button style={styles.btnSecondary} onClick={() => setReplyingId(null)}>إلغاء</button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                              <button style={styles.btnSecondary} onClick={() => { setReplyingId(c.id); setReplyText(c.reply ?? '') }}>
                                {c.reply ? 'تعديل الرد' : 'رد'}
                              </button>
                              {c.status !== 'closed' && (
                                <button style={styles.btnSecondary} onClick={async () => {
                                  await adminFetch('/api/admin/consultations', { method: 'PATCH', body: JSON.stringify({ id: c.id, status: 'closed' }) })
                                  setConsults(cs => cs.map(x => x.id === c.id ? { ...x, status: 'closed' } : x))
                                }}>إغلاق</button>
                              )}
                              <button style={styles.btnDanger} onClick={() => setConfirmDel({ type: 'consult', id: c.id, label: c.subject })}>حذف</button>
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', flexShrink: 0 }}>{new Date(c.created_at).toLocaleDateString('ar-SA')}</div>
                      </div>
                    </div>
                  ))}
                  {consults.length === 0 && <div style={{ color: '#94a3b8', textAlign: 'center', padding: 40 }}>لا توجد استشارات</div>}
                </div>
              </div>
            )}

            {/* ── EVALUATION ── */}
            {tab === 'evaluation' && (
              <div>
                <h2 style={styles.heading}>تقييم الورشة</h2>
                <div style={{ display: 'flex', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
                  {/* Toggle open/close */}
                  <div style={{ ...styles.card, flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>حالة التقييم</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{evalSettings.is_open ? '🟢 مفتوح' : '🔴 مغلق'}</div>
                    </div>
                    <button style={evalSettings.is_open ? styles.btnDanger : styles.btnPrimary} onClick={async () => {
                      const newVal = !evalSettings.is_open
                      await adminFetch('/api/admin/eval-settings', { method: 'PATCH', body: JSON.stringify({ is_open: newVal }) })
                      setEvalSettings({ is_open: newVal })
                    }}>{evalSettings.is_open ? 'إغلاق' : 'فتح'}</button>
                  </div>
                  {/* Public link */}
                  <div style={{ ...styles.card, flex: 1, minWidth: 220 }}>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>رابط التقييم العام</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 10 }}>شاركه بدون تسجيل دخول</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input readOnly value={typeof window !== 'undefined' ? `${window.location.origin}/rate` : '/rate'}
                        style={{ flex: 1, border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '6px 10px', fontSize: '0.8rem', color: '#475569', background: '#f8fafc', outline: 'none' }} />
                      <button style={styles.btnPrimary} onClick={() => navigator.clipboard.writeText(`${window.location.origin}/rate`)}>نسخ</button>
                    </div>
                  </div>
                </div>

                {wsEvals.length > 0 && (
                  <div style={{ ...styles.card, marginBottom: 20 }}>
                    <div style={styles.cardTitle}>متوسطات التقييم ({wsEvals.length} تقييم)</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginTop: 12 }}>
                      {[['trainer_rating', 'المدرّب'], ['interaction_rating', 'التفاعل'], ['content_rating', 'المحتوى'], ['facilities_rating', 'التجهيزات'], ['benefit_rating', 'الفائدة']].map(([k, lbl]) => (
                        <div key={k} style={{ textAlign: 'center', background: '#f8fafc', borderRadius: 10, padding: '12px 8px' }}>
                          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e5fdc' }}>{avg(wsEvals, k as keyof WsEval)}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{lbl}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={styles.card}>
                  <table style={styles.table}>
                    <thead><tr>
                      {['المشارك', 'مصدر', 'مدرّب', 'تفاعل', 'محتوى', 'تجهيزات', 'فائدة', 'التاريخ', ''].map(h => <th key={h} style={styles.th}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {wsEvals.map(e => (
                        <tr key={e.id} style={styles.tr}>
                          <td style={styles.td}>{e.user_name ?? '—'}</td>
                          <td style={styles.td}>
                            <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 99, fontWeight: 600,
                              background: e.source === 'public' ? '#fef3c7' : '#eff6ff',
                              color:      e.source === 'public' ? '#92400e' : '#1e40af' }}>
                              {e.source === 'public' ? 'عام' : 'مسجّل'}
                            </span>
                          </td>
                          {[e.trainer_rating, e.interaction_rating, e.content_rating, e.facilities_rating, e.benefit_rating].map((v, i) => (
                            <td key={i} style={styles.td}><span style={{ fontWeight: 700, color: v >= 8 ? '#16a34a' : v >= 5 ? '#f59e0b' : '#ef4444' }}>{v}</span></td>
                          ))}
                          <td style={styles.td}>{new Date(e.created_at).toLocaleDateString('ar-SA')}</td>
                          <td style={styles.td}><button style={styles.btnDanger} onClick={() => setConfirmDel({ type: 'wseval', id: e.id, label: e.user_name ?? '' })}>حذف</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </>
        )}
      </main>

      {/* Confirm Delete Modal */}
      {confirmDel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '28px 32px', maxWidth: 360, width: '90%', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>🗑️</div>
            <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>هل تريد الحذف؟</div>
            {confirmDel.label && (
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 4, fontWeight: 500 }}>{confirmDel.label}</div>
            )}
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 24 }}>لا يمكن التراجع عن هذا الإجراء</div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button style={styles.btnDanger} onClick={confirmDelete} disabled={deleting}>
                {deleting ? '...' : 'حذف'}
              </button>
              <button style={styles.btnSecondary} onClick={() => setConfirmDel(null)} disabled={deleting}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Styles ──
const styles = {
  heading: { fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: 20 } as React.CSSProperties,
  topRow:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 } as React.CSSProperties,
  card:    { background: 'white', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' } as React.CSSProperties,
  cardTitle: { fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 } as React.CSSProperties,
  table:   { width: '100%', borderCollapse: 'collapse' } as React.CSSProperties,
  th:      { textAlign: 'right', padding: '10px 12px', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' } as React.CSSProperties,
  td:      { padding: '10px 12px', fontSize: '0.84rem', color: '#334155', borderBottom: '1px solid #f1f5f9' } as React.CSSProperties,
  tr:      { transition: 'background 0.1s' } as React.CSSProperties,
  input:   { border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit' } as React.CSSProperties,
  btnPrimary:  { background: '#1e5fdc', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 600 } as React.CSSProperties,
  btnSecondary:{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: '0.84rem' } as React.CSSProperties,
  btnDanger:   { background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 } as React.CSSProperties,
  badge: (color: string) => ({ fontSize: '0.68rem', background: color + '20', color, padding: '2px 8px', borderRadius: 99, fontWeight: 600 }) as React.CSSProperties,
}

function exportRegistrationsCSV(regs: WsRegistration[]) {
  const rows = [
    ['الاسم', 'الهاتف', 'البريد', 'الورشة', 'التاريخ'],
    ...regs.map(r => [r.name, r.phone, r.email ?? '', r.workshop_title, new Date(r.created_at).toLocaleDateString('ar-SA')]),
  ]
  const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `registrations-${new Date().toISOString().slice(0,10)}.csv`; a.click()
}

function exportCSV(surveys: Survey[]) {
  const rows = [
    ['الاسم', 'البريد', 'النوع', 'النتيجة', 'اللغة', 'التاريخ'],
    ...surveys.map(s => [s.name ?? '', s.email ?? '', s.survey_type, s.total_score != null ? Math.round(s.total_score) : '', s.language, new Date(s.created_at).toLocaleDateString('ar-SA')]),
  ]
  const csv = rows.map(r => r.join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `surveys-${new Date().toISOString().slice(0,10)}.csv`; a.click()
}
