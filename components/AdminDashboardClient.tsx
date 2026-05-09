'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase())

type AdminTab = 'overview' | 'surveys' | 'users' | 'workshops' | 'registrations' | 'consultations' | 'evaluation'

type Survey     = { id: string; name: string | null; email: string | null; survey_type: string; total_score: number | null; modal_scores: Record<string,unknown> | null; language: string; created_at: string }
type SiteUser   = { id: string; email: string; created_at: string; user_metadata: { name?: string; full_name?: string; phone?: string } }
type Workshop   = { id: string; name_ar: string; name_en: string | null; description_ar: string | null; category: string | null; duration: string | null; discount_percent: number | null; discount_code: string | null; is_active: boolean; post_assessment_open: boolean; evaluation_open: boolean }
type Material   = { id: string; workshop_id: string; name: string; url: string; content_type: string; sort_order: number }
type Enrollment = { id: string; workshop_id: string; user_id: string | null; user_email: string | null; created_at: string; cert_url?: string | null }
type WsRegistration = { id: string; workshop_id: string | null; workshop_title: string; name: string; phone: string; email: string | null; created_at: string }
type Consult    = { id: string; user_email: string | null; user_name: string | null; subject: string; message: string; reply: string | null; status: string; created_at: string }
type EvalSettings = { is_open: boolean }
type WsEval     = { id: string; user_name: string | null; workshop_id: string | null; trainer_rating: number; interaction_rating: number; content_rating: number; facilities_rating: number; benefit_rating: number; comments: string | null; source: string | null; created_at: string }
type StrangeVote = { id: string; avg_score: number; session_id: string | null; created_at: string }
type StrangeProf = { id: string; workshop_id: string; name: string; code: string; is_active: boolean; strange_profession_votes: StrangeVote[] }

const NAV: { key: AdminTab; label: string; icon: string }[] = [
  { key: 'overview',      label: 'نظرة عامة',     icon: '📊' },
  { key: 'surveys',       label: 'الاختبارات',     icon: '📋' },
  { key: 'users',         label: 'المستخدمون',     icon: '👥' },
  { key: 'workshops',     label: 'الدورات',         icon: '🎓' },
  { key: 'registrations', label: 'التسجيلات',      icon: '📝' },
  { key: 'consultations', label: 'الاستشارات',      icon: '💬' },
  { key: 'evaluation',    label: 'التقييم العام',   icon: '⭐' },
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

  // cert url inputs (controlled, keyed by enrollment id)
  const [certUrls, setCertUrls] = useState<Record<string, string>>({})

  // search
  const [wsSearch, setWsSearch]     = useState('')
  const [userSearch, setUserSearch] = useState('')

  // strange professions
  const [strangeProfessions, setStrangeProfessions] = useState<StrangeProf[]>([])
  const [strangeName, setStrangeName] = useState('')
  const [strangeSaving, setStrangeSaving] = useState(false)
  const [wsPanel, setWsPanel] = useState<'materials' | 'enrollments' | 'strange' | 'evals'>('materials')
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
    setCertUrls(prev => {
      const next = { ...prev }
      enrollments.forEach(e => { if (!(e.id in next)) next[e.id] = e.cert_url ?? '' })
      return next
    })
  }, [enrollments])

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
                    <input placeholder="بحث باسم أو بريد..." value={userSearch} onChange={e => setUserSearch(e.target.value)}
                      style={{ ...styles.input, width: 180 }} />
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
                      {users.filter(u => !userSearch || (u.user_metadata?.name ?? u.user_metadata?.full_name ?? '').includes(userSearch) || u.email?.toLowerCase().includes(userSearch.toLowerCase())).map(u => (
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
              <div>
                {/* ── Workshop detail view (drill-down) ── */}
                {selectedWs ? (
                  <WorkshopDetail
                    ws={selectedWs}
                    materials={materials} enrollments={enrollments} wsEvals={wsEvals}
                    users={users} strangeProfessions={strangeProfessions} expandedVotes={expandedVotes}
                    wsPanel={wsPanel} matForm={matForm} matFormSaving={matFormSaving}
                    enrEmail={enrEmail} enrSaving={enrSaving} strangeName={strangeName} strangeSaving={strangeSaving}
                    certUrls={certUrls}
                    onBack={() => setSelectedWs(null)}
                    onDelete={(type, id, label) => setConfirmDel({ type, id, label })}
                    onToggle={async (key) => {
                      const next = !selectedWs[key]
                      await adminFetch('/api/admin/workshops', { method: 'PATCH', body: JSON.stringify({ id: selectedWs.id, [key]: next }) })
                      setSelectedWs(w => w ? { ...w, [key]: next } : w)
                      setWorkshops(ws => ws.map(w => w.id === selectedWs.id ? { ...w, [key]: next } : w))
                    }}
                    onPanelChange={setWsPanel}
                    onMatFormChange={v => setMatForm(f => ({ ...f, ...v }))}
                    onMatAdd={async () => {
                      setMatFormSaving(true)
                      const res = await adminFetch('/api/admin/materials', { method: 'POST', body: JSON.stringify({ ...matForm, workshop_id: selectedWs.id }) })
                      if (res.ok) { const d = await res.json(); setMaterials(m => [...m, { ...matForm, id: d.id, workshop_id: selectedWs.id, sort_order: 0 }]); setMatForm({ name: '', url: '', content_type: 'file' }) }
                      setMatFormSaving(false)
                    }}
                    onEnrEmailChange={setEnrEmail}
                    onEnrAdd={async () => {
                      setEnrSaving(true)
                      const res = await adminFetch('/api/admin/enrollments', { method: 'POST', body: JSON.stringify({ workshop_id: selectedWs.id, user_email: enrEmail }) })
                      if (res.ok) { fetchAll(); setEnrEmail('') }
                      setEnrSaving(false)
                    }}
                    onCertUrlChange={(id, url) => setCertUrls(prev => ({ ...prev, [id]: url }))}
                    onCertUrlSave={async (id) => {
                      const url = certUrls[id]?.trim() ?? ''
                      const res = await adminFetch('/api/admin/enrollments', { method: 'PATCH', body: JSON.stringify({ id, cert_url: url || null }) })
                      if (res.ok) setEnrollments(prev => prev.map(x => x.id === id ? { ...x, cert_url: url || null } : x))
                    }}
                    onStrangeNameChange={setStrangeName}
                    onStrangeAdd={async () => {
                      setStrangeSaving(true)
                      const res = await adminFetch('/api/admin/strange', { method: 'POST', body: JSON.stringify({ workshop_id: selectedWs.id, name: strangeName }) })
                      if (res.ok) { const d = await res.json(); setStrangeProfessions(ps => [...ps, { id: d.id, workshop_id: selectedWs.id, name: strangeName, code: d.code, is_active: true, strange_profession_votes: [] }]); setStrangeName('') }
                      setStrangeSaving(false)
                    }}
                    onStrangeDelete={(id) => { setStrangeProfessions(ps => ps.filter(x => x.id !== id)); adminFetch('/api/admin/strange', { method: 'DELETE', body: JSON.stringify({ id }) }) }}
                    onVoteDelete={(profId, voteId) => {
                      adminFetch('/api/admin/strange', { method: 'DELETE', body: JSON.stringify({ vote_id: voteId }) })
                      setStrangeProfessions(ps => ps.map(x => x.id === profId ? { ...x, strange_profession_votes: x.strange_profession_votes.filter(v => v.id !== voteId) } : x))
                    }}
                    onExpandVotes={setExpandedVotes}
                  />
                ) : (
                <>
                {/* Header + search */}
                <div style={styles.topRow}>
                  <h2 style={styles.heading}>الدورات ({workshops.length})</h2>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input placeholder="بحث..." value={wsSearch} onChange={e => setWsSearch(e.target.value)}
                      style={{ ...styles.input, width: 160 }} />
                    <button style={styles.btnPrimary} onClick={() => setWsFormOpen(v => !v)}>+ دورة جديدة</button>
                  </div>
                </div>

                {wsFormOpen && (
                  <div style={{ ...styles.card, marginBottom: 16 }}>
                    <div style={styles.cardTitle}>إضافة دورة</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {[['name_ar', 'الاسم بالعربي *'], ['name_en', 'الاسم بالانجليزي'], ['description_ar', 'الوصف'], ['category', 'الفئة'], ['duration', 'المدة'], ['discount_percent', 'الخصم %'], ['discount_code', 'كود الخصم']].map(([k, lbl]) => (
                        <input key={k} placeholder={lbl} value={wsForm[k as keyof typeof wsForm]}
                          onChange={e => setWsForm(f => ({ ...f, [k]: e.target.value }))}
                          style={{ ...styles.input, gridColumn: k === 'description_ar' ? 'span 2' : undefined }} />
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button style={styles.btnPrimary} disabled={wsFormSaving || !wsForm.name_ar} onClick={async () => {
                        setWsFormSaving(true)
                        const res = await adminFetch('/api/admin/workshops', { method: 'POST', body: JSON.stringify({ ...wsForm, discount_percent: Number(wsForm.discount_percent) || 0 }) })
                        if (res.ok) { setWsFormOpen(false); setWsForm({ name_ar: '', name_en: '', description_ar: '', category: '', duration: '', discount_percent: '', discount_code: '' }); fetchAll() }
                        setWsFormSaving(false)
                      }}>{wsFormSaving ? '...' : 'حفظ'}</button>
                      <button style={styles.btnSecondary} onClick={() => setWsFormOpen(false)}>إلغاء</button>
                    </div>
                  </div>
                )}

                {/* Workshop grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                  {workshops.filter(ws => !wsSearch || ws.name_ar.includes(wsSearch) || (ws.name_en ?? '').toLowerCase().includes(wsSearch.toLowerCase())).map(ws => {
                    const wsEnrs = enrollments.filter(e => e.workshop_id === ws.id)
                    const wsMats = materials.filter(m => m.workshop_id === ws.id)
                    const wsEvCount = wsEvals.filter(e => e.workshop_id === ws.id).length
                    return (
                      <div key={ws.id} style={{ ...styles.card, cursor: 'pointer', border: '2px solid transparent', transition: 'border-color 0.15s' }}
                        onClick={() => {
                          const next = ws
                          setSelectedWs(next)
                          setWsPanel('materials')
                          if (next) fetch(`/api/admin/strange?workshop_id=${next.id}`).then(r => r.json()).then(setStrangeProfessions)
                        }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a', flex: 1, marginLeft: 8 }}>{ws.name_ar}</div>
                          <button style={{ ...styles.btnDanger, padding: '4px 8px', flexShrink: 0 }}
                            onClick={e => { e.stopPropagation(); setConfirmDel({ type: 'workshop', id: ws.id, label: ws.name_ar }) }}>حذف</button>
                        </div>
                        {ws.name_en && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 10 }}>{ws.name_en}</div>}
                        {/* Stats row */}
                        <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', color: '#64748b', marginBottom: 10 }}>
                          <span>📁 {wsMats.length} مادة</span>
                          <span>👥 {wsEnrs.length} مسجّل</span>
                          <span>⭐ {wsEvCount} تقييم</span>
                        </div>
                        {/* Status badges */}
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '3px 8px', borderRadius: 99,
                            background: ws.post_assessment_open ? '#dcfce7' : '#f1f5f9',
                            color: ws.post_assessment_open ? '#15803d' : '#94a3b8' }}>
                            {ws.post_assessment_open ? '🟢 اختبار بعدي' : '⚪ اختبار بعدي'}
                          </span>
                          <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '3px 8px', borderRadius: 99,
                            background: ws.evaluation_open ? '#fef9c3' : '#f1f5f9',
                            color: ws.evaluation_open ? '#854d0e' : '#94a3b8' }}>
                            {ws.evaluation_open ? '🟡 تقييم مفتوح' : '⚪ تقييم مغلق'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>

              {/* end workshop list */}
              </>
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
                <h2 style={styles.heading}>التقييم العام <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#94a3b8' }}>— يتحكم بصفحة /rate بدون تسجيل دخول</span></h2>
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

// ── Workshop Detail (drill-down full page) ──
function WorkshopDetail({
  ws, materials, enrollments, wsEvals, users, strangeProfessions, expandedVotes,
  wsPanel, matForm, matFormSaving, enrEmail, enrSaving, strangeName, strangeSaving, certUrls,
  onBack, onDelete, onToggle, onPanelChange, onMatFormChange, onMatAdd,
  onEnrEmailChange, onEnrAdd, onCertUrlChange, onCertUrlSave,
  onStrangeNameChange, onStrangeAdd, onStrangeDelete, onVoteDelete, onExpandVotes,
}: {
  ws: Workshop; materials: Material[]; enrollments: Enrollment[]; wsEvals: WsEval[]
  users: SiteUser[]; strangeProfessions: StrangeProf[]; expandedVotes: string | null
  wsPanel: 'materials'|'enrollments'|'strange'|'evals'
  matForm: { name: string; url: string; content_type: string }; matFormSaving: boolean
  enrEmail: string; enrSaving: boolean; strangeName: string; strangeSaving: boolean
  certUrls: Record<string, string>
  onBack: () => void
  onDelete: (type: string, id: string, label: string) => void
  onToggle: (key: 'post_assessment_open'|'evaluation_open') => void
  onPanelChange: (p: 'materials'|'enrollments'|'strange'|'evals') => void
  onMatFormChange: (v: Partial<{name:string;url:string;content_type:string}>) => void
  onMatAdd: () => void
  onEnrEmailChange: (v: string) => void
  onEnrAdd: () => void
  onCertUrlChange: (id: string, url: string) => void
  onCertUrlSave: (id: string) => void
  onStrangeNameChange: (v: string) => void
  onStrangeAdd: () => void
  onStrangeDelete: (id: string) => void
  onVoteDelete: (profId: string, voteId: string) => void
  onExpandVotes: (id: string | null) => void
}) {
  const wsMats  = materials.filter(m => m.workshop_id === ws.id)
  const wsEnrs  = enrollments.filter(e => e.workshop_id === ws.id)
  const wsEvalsFiltered = wsEvals.filter(e => e.workshop_id === ws.id)
  const wsProfs = [...strangeProfessions].filter(p => p.workshop_id === ws.id).sort((a, b) => {
    const aAvg = a.strange_profession_votes.length ? a.strange_profession_votes.reduce((s, v) => s + v.avg_score, 0) / a.strange_profession_votes.length : 0
    const bAvg = b.strange_profession_votes.length ? b.strange_profession_votes.reduce((s, v) => s + v.avg_score, 0) / b.strange_profession_votes.length : 0
    return bAvg - aAvg
  })
  const evalKeys: [keyof WsEval, string][] = [['trainer_rating','المدرّب'],['interaction_rating','التفاعل'],['content_rating','المحتوى'],['facilities_rating','التجهيزات'],['benefit_rating','الفائدة']]

  const TABS: { key: 'materials'|'enrollments'|'evals'|'strange'; label: string; count: number }[] = [
    { key: 'materials',  label: 'المواد',      count: wsMats.length },
    { key: 'enrollments',label: 'المسجّلون',   count: wsEnrs.length },
    { key: 'evals',      label: 'التقييمات',   count: wsEvalsFiltered.length },
    { key: 'strange',    label: 'المهن 🎭',    count: wsProfs.length },
  ]

  return (
    <div dir="rtl">
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        <button onClick={onBack} style={{ ...styles.btnSecondary, display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px' }}>
          ← الدورات
        </button>
        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>/</span>
        <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0f172a' }}>{ws.name_ar}</span>
      </div>

      {/* Workshop header card */}
      <div style={{ background: 'white', borderRadius: 16, padding: '24px 28px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{ws.name_ar}</h2>
            {ws.name_en && <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 4 }}>{ws.name_en}</div>}
            {ws.description_ar && <div style={{ fontSize: '0.88rem', color: '#475569', marginTop: 8, maxWidth: 560 }}>{ws.description_ar}</div>}
            <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: '0.8rem', color: '#64748b', flexWrap: 'wrap' }}>
              {ws.category  && <span>📂 {ws.category}</span>}
              {ws.duration   && <span>⏱ {ws.duration}</span>}
              {ws.discount_percent ? <span>🏷 {ws.discount_percent}% — كود: {ws.discount_code}</span> : null}
            </div>
          </div>
          {/* Toggles */}
          <div style={{ display: 'flex', gap: 10 }}>
            {([
              { label: 'الاختبار البعدي', key: 'post_assessment_open' as const, activeColor: '#16a34a', activeBg: '#dcfce7' },
              { label: 'تقييم الورشة',   key: 'evaluation_open'     as const, activeColor: '#b45309', activeBg: '#fef9c3' },
            ]).map(({ label, key, activeColor, activeBg }) => {
              const on = ws[key]
              return (
                <button key={key} onClick={() => onToggle(key)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '10px 18px', borderRadius: 12, border: `1.5px solid ${on ? activeColor + '50' : '#e2e8f0'}`, background: on ? activeBg : '#f8fafc', cursor: 'pointer', fontFamily: 'inherit' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: on ? activeColor : '#94a3b8' }}>{label}</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: on ? activeColor : '#cbd5e1' }}>{on ? '● مفتوح' : '○ مغلق'}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 0, borderBottom: '2px solid #e2e8f0' }}>
        {TABS.map(({ key, label, count }) => (
          <button key={key} onClick={() => onPanelChange(key)}
            style={{ padding: '12px 22px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: wsPanel === key ? 700 : 400, color: wsPanel === key ? '#1e5fdc' : '#64748b', borderBottom: `3px solid ${wsPanel === key ? '#1e5fdc' : 'transparent'}`, marginBottom: -2, display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
            {label}
            <span style={{ fontSize: '0.72rem', background: wsPanel === key ? '#dbeafe' : '#f1f5f9', color: wsPanel === key ? '#1e5fdc' : '#94a3b8', borderRadius: 99, padding: '1px 7px', fontWeight: 700 }}>{count}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ background: 'white', borderRadius: '0 0 16px 16px', padding: '28px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }}>

        {/* Materials */}
        {wsPanel === 'materials' && (
          <div>
            {wsMats.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center', padding: '32px 0' }}>لا توجد مواد بعد</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {wsMats.map(m => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#f8fafc', borderRadius: 10 }}>
                  <span style={{ fontSize: '1.1rem' }}>{m.content_type === 'video' ? '🎬' : m.content_type === 'link' ? '🔗' : m.content_type === 'quiz' ? '📝' : '📄'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b' }}>{m.name}</div>
                    <a href={m.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.72rem', color: '#94a3b8', textDecoration: 'none' }}>{m.url}</a>
                  </div>
                  <button style={styles.btnDanger} onClick={() => onDelete('material', m.id, m.name)}>×</button>
                </div>
              ))}
            </div>
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: '20px' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#475569', marginBottom: 12 }}>+ إضافة مادة</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10 }}>
                <input placeholder="اسم المادة" value={matForm.name} onChange={e => onMatFormChange({ name: e.target.value })} style={{ ...styles.input, gridColumn: 'span 3' }} />
                <input placeholder="رابط URL" value={matForm.url} onChange={e => onMatFormChange({ url: e.target.value })} style={styles.input} />
                <select value={matForm.content_type} onChange={e => onMatFormChange({ content_type: e.target.value })} style={styles.input}>
                  {['file','video','link','quiz'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <button style={styles.btnPrimary} disabled={matFormSaving || !matForm.name || !matForm.url} onClick={onMatAdd}>{matFormSaving ? '...' : 'إضافة'}</button>
              </div>
            </div>
          </div>
        )}

        {/* Enrollments */}
        {wsPanel === 'enrollments' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12, marginBottom: 24 }}>
              {wsEnrs.length === 0 && <p style={{ color: '#94a3b8', gridColumn: '1 / -1', textAlign: 'center', padding: '32px 0' }}>لا يوجد مسجّلون بعد</p>}
              {wsEnrs.map(e => {
                const u = users.find(u => u.id === e.user_id)
                const userName = u?.user_metadata?.name ?? u?.user_metadata?.full_name ?? ''
                const initial = (userName || e.user_email || '?')[0].toUpperCase()
                return (
                  <div key={e.id} style={{ background: '#f8fafc', borderRadius: 12, padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, color: '#4f46e5', flexShrink: 0 }}>
                        {initial}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {userName && <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{userName}</div>}
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.user_email ?? '—'}</div>
                      </div>
                      <button style={{ ...styles.btnDanger, padding: '4px 10px' }} onClick={() => onDelete('enrollment', e.id, e.user_email ?? '')}>×</button>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input placeholder="رابط الشهادة..." value={certUrls[e.id] ?? ''} onChange={ev => onCertUrlChange(e.id, ev.target.value)}
                        style={{ ...styles.input, flex: 1, fontSize: '0.8rem', padding: '6px 10px' }} />
                      <button style={{ ...styles.btnSecondary, fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => onCertUrlSave(e.id)}>حفظ</button>
                      {certUrls[e.id] && (
                        <a href={certUrls[e.id]} target="_blank" rel="noopener noreferrer" style={{ ...styles.btnPrimary, fontSize: '0.8rem', padding: '6px 12px', textDecoration: 'none' }}>🎓</a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: '16px', display: 'flex', gap: 10 }}>
              <input placeholder="بريد المستخدم" value={enrEmail} onChange={e => onEnrEmailChange(e.target.value)} style={{ ...styles.input, flex: 1 }} />
              <button style={styles.btnPrimary} disabled={enrSaving || !enrEmail} onClick={onEnrAdd}>{enrSaving ? '...' : '+ تسجيل'}</button>
            </div>
          </div>
        )}

        {/* Evaluations */}
        {wsPanel === 'evals' && (
          wsEvalsFiltered.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '48px 0' }}>لا توجد تقييمات بعد</p>
          ) : (
            <div>
              {/* Averages */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
                {evalKeys.map(([k, lbl]) => {
                  const v = Number(avg(wsEvalsFiltered, k))
                  return (
                    <div key={k} style={{ background: '#f8fafc', borderRadius: 12, padding: '16px 8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '2rem', fontWeight: 800, color: v >= 8 ? '#16a34a' : v >= 5 ? '#f59e0b' : '#ef4444' }}>{v}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>{lbl}</div>
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {wsEvalsFiltered.map(e => (
                  <div key={e.id} style={{ background: '#f8fafc', borderRadius: 12, padding: '14px 18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{e.user_name ?? 'مجهول'}</span>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(e.created_at).toLocaleDateString('ar-SA')}</span>
                        <button style={{ ...styles.btnDanger, fontSize: '0.72rem', padding: '3px 8px' }} onClick={() => onDelete('wseval', e.id, e.user_name ?? '')}>حذف</button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {evalKeys.map(([k, lbl]) => {
                        const v = Number(e[k])
                        return <span key={k} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '4px 12px', fontSize: '0.82rem' }}>
                          {lbl} <strong style={{ color: v >= 8 ? '#16a34a' : v >= 5 ? '#f59e0b' : '#ef4444' }}>{v}</strong>
                        </span>
                      })}
                    </div>
                    {e.comments && <p style={{ color: '#64748b', marginTop: 10, fontSize: '0.85rem', fontStyle: 'italic' }}>{e.comments}</p>}
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {/* Strange professions */}
        {wsPanel === 'strange' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <a href="/strange/results" target="_blank" rel="noopener noreferrer"
                style={{ ...styles.btnSecondary, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                🏆 عرض النتائج العامة
              </a>
            </div>
            {wsProfs.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center', padding: '32px 0' }}>لا توجد مهن بعد</p>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginBottom: 24 }}>
              {wsProfs.map((p, idx) => {
                const votes = p.strange_profession_votes
                const avgScore = votes.length ? (votes.reduce((s, v) => s + v.avg_score, 0) / votes.length).toFixed(1) : '—'
                const isWinner = idx === 0 && votes.length > 0
                const link = typeof window !== 'undefined' ? `${window.location.origin}/strange/${p.code}` : `/strange/${p.code}`
                return (
                  <div key={p.id} style={{ background: '#f8fafc', borderRadius: 12, padding: '16px', border: isWinner ? '2px solid #f59e0b' : '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                          {isWinner && '🏆'} {p.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
                          كود: <strong style={{ color: '#1e5fdc' }}>{p.code}</strong> · {votes.length} صوت · {avgScore}/5
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button style={{ ...styles.btnSecondary, fontSize: '0.72rem', padding: '4px 8px' }} onClick={() => navigator.clipboard.writeText(link)}>نسخ</button>
                        <button style={styles.btnDanger} onClick={() => onStrangeDelete(p.id)}>×</button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`} alt="QR" style={{ width: 64, height: 64, borderRadius: 8 }} />
                      <a href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(link)}`} download={`qr-${p.code}.png`} target="_blank" rel="noopener noreferrer"
                        style={{ ...styles.btnSecondary, fontSize: '0.72rem', padding: '4px 8px', textDecoration: 'none', display: 'inline-block' }}>⬇ QR</a>
                    </div>
                    {votes.length > 0 && (
                      <div style={{ marginTop: 10 }}>
                        <button onClick={() => onExpandVotes(expandedVotes === p.id ? null : p.id)}
                          style={{ fontSize: '0.75rem', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
                          {expandedVotes === p.id ? '▲ إخفاء' : `▼ الأصوات (${votes.length})`}
                        </button>
                        {expandedVotes === p.id && (
                          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {votes.map((v, vi) => (
                              <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', borderRadius: 8, padding: '6px 10px', fontSize: '0.75rem' }}>
                                <span>#{vi+1} <strong style={{ color: '#1e5fdc' }}>{v.avg_score.toFixed(1)}/5</strong> <span style={{ color: '#94a3b8' }}>{new Date(v.created_at).toLocaleDateString('ar-SA', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}</span></span>
                                <button style={{ ...styles.btnDanger, fontSize: '0.65rem', padding: '2px 6px' }} onClick={() => onVoteDelete(p.id, v.id)}>حذف</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: '16px', display: 'flex', gap: 10 }}>
              <input placeholder="اسم المهنة الغريبة" value={strangeName} onChange={e => onStrangeNameChange(e.target.value)} style={{ ...styles.input, flex: 1 }} />
              <button style={styles.btnPrimary} disabled={strangeSaving || !strangeName} onClick={onStrangeAdd}>{strangeSaving ? '...' : '+ إضافة'}</button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
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
