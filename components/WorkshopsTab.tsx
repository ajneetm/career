'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

type Workshop = {
  id: string
  name_ar: string
  name_en: string | null
  description_ar: string | null
  discount_percent: number | null
  discount_code: string | null
  category: string | null
  duration: string | null
}

type Material = {
  id: string
  name: string
  url: string
  content_type: 'file' | 'video' | 'link' | 'quiz'
  sort_order: number
}

type WsTab = 'materials' | 'evaluation'

const CONTENT_ICON: Record<string, string> = {
  file: '📄', video: '🎬', link: '🔗', quiz: '📝',
}

export function WorkshopsTab({ user }: { user: User }) {
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState<string | null>(null)

  // workshop detail
  const [selected, setSelected] = useState<Workshop | null>(null)
  const [wsTab, setWsTab] = useState<WsTab>('materials')
  const [materials, setMaterials] = useState<Material[]>([])
  const [matLoading, setMatLoading] = useState(false)
  const [evalOpen, setEvalOpen] = useState(false)
  const [myEval, setMyEval] = useState(false)

  useEffect(() => {
    Promise.all([
      supabase.from('workshops').select('*').eq('is_active', true).order('created_at'),
      supabase.from('workshop_enrollments').select('workshop_id').eq('user_id', user.id),
    ]).then(([{ data: ws }, { data: en }]) => {
      const list = ws ?? []
      const ids = new Set((en ?? []).map((e: { workshop_id: string }) => e.workshop_id))
      setWorkshops(list)
      setEnrolledIds(ids)
      setLoading(false)
      // auto-open if only one enrollment
      if (ids.size === 1) {
        const auto = list.find(w => ids.has(w.id))
        if (auto) openWorkshop(auto, ids)
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id])

  async function openWorkshop(ws: Workshop, ids?: Set<string>) {
    setSelected(ws)
    setWsTab('materials')
    setMatLoading(true)
    const enrolled = ids ?? enrolledIds
    if (!enrolled.has(ws.id)) { setMatLoading(false); return }

    const [{ data: mats }, { data: evalSettings }, { data: myEvalRow }] = await Promise.all([
      supabase.from('workshop_materials').select('*').eq('workshop_id', ws.id).order('sort_order'),
      supabase.from('evaluation_settings').select('is_open').eq('id', 1).single(),
      supabase.from('workshop_evaluations').select('id').eq('user_id', user.id).maybeSingle(),
    ])
    setMaterials(mats ?? [])
    setEvalOpen(evalSettings?.is_open ?? false)
    setMyEval(!!myEvalRow)
    setMatLoading(false)
  }

  async function enroll(ws: Workshop) {
    setEnrolling(ws.id)
    await fetch('/api/enroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workshop_id: ws.id, user_id: user.id, user_email: user.email }),
    })
    const newIds = new Set(enrolledIds)
    newIds.add(ws.id)
    setEnrolledIds(newIds)
    setEnrolling(null)
    openWorkshop(ws, newIds)
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>جارِ التحميل...</div>

  // ── Workshop Detail ──
  if (selected) {
    const isEnrolled = enrolledIds.has(selected.id)
    const WS_TABS: { key: WsTab; label: string }[] = [
      { key: 'materials',  label: '📄 المواد' },
      { key: 'evaluation', label: '⭐ التقييم' },
    ]
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={() => setSelected(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '0.85rem', padding: 0 }}>
            ← الدورات
          </button>
          <span style={{ color: '#e2e8f0' }}>|</span>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{selected.name_ar}</h2>
        </div>

        {!isEnrolled ? (
          <div className="assessment-card" style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ color: '#64748b', marginBottom: 16 }}>سجّل في الدورة لتتمكن من الوصول للمواد</p>
            <button className="btn-primary" onClick={() => enroll(selected)} disabled={enrolling === selected.id}>
              {enrolling === selected.id ? 'جارِ التسجيل...' : 'التسجيل في الدورة'}
            </button>
          </div>
        ) : (
          <>
            {/* mini-tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid #e2e8f0', paddingBottom: 0 }}>
              {WS_TABS.map(({ key, label }) => (
                <button key={key} onClick={() => setWsTab(key)}
                  style={{ padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
                    borderBottom: `2px solid ${wsTab === key ? '#1e5fdc' : 'transparent'}`,
                    color: wsTab === key ? '#1e5fdc' : '#64748b', fontWeight: wsTab === key ? 600 : 400,
                    fontSize: '0.88rem', marginBottom: -1 }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Materials */}
            {wsTab === 'materials' && (
              <div>
                {matLoading ? (
                  <p style={{ color: '#94a3b8', textAlign: 'center' }}>جارِ التحميل...</p>
                ) : materials.length === 0 ? (
                  <div className="assessment-card" style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>
                    لا توجد مواد بعد
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {materials.map(m => (
                      <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer"
                        style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12,
                          background: 'white', borderRadius: 12, padding: '14px 18px',
                          border: '1px solid #e2e8f0', color: '#1e293b', transition: 'box-shadow 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
                        onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
                        <span style={{ fontSize: '1.2rem' }}>{CONTENT_ICON[m.content_type] ?? '📄'}</span>
                        <span style={{ fontWeight: 500, fontSize: '0.9rem', flex: 1 }}>{m.name}</span>
                        <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>فتح ↗</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}


            {/* Evaluation */}
            {wsTab === 'evaluation' && (
              <div className="assessment-card" style={{ textAlign: 'center', padding: 40 }}>
                {myEval ? (
                  <>
                    <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>✅</div>
                    <p style={{ fontWeight: 600, color: '#16a34a' }}>شكراً على تقييمك!</p>
                  </>
                ) : evalOpen ? (
                  <>
                    <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⭐</div>
                    <p style={{ color: '#64748b', marginBottom: 20, fontSize: '0.88rem' }}>
                      شاركنا رأيك في الورشة
                    </p>
                    <Link href="/evaluation" className="btn-primary">تقييم الورشة</Link>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔒</div>
                    <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
                      سيُفتح التقييم في نهاية الورشة
                    </p>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  // ── Workshop List ──
  return (
    <div>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>الدورات المتاحة</h2>

      {workshops.length === 0 ? (
        <div className="assessment-card" style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
          لا توجد دورات متاحة حالياً
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {workshops.map(ws => {
            const enrolled = enrolledIds.has(ws.id)
            return (
              <div key={ws.id} className="assessment-card"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 20px', borderRight: `3px solid ${enrolled ? '#16a34a' : '#e2e8f0'}` }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.92rem', color: '#1e293b' }}>{ws.name_ar}</span>
                    {enrolled && (
                      <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#16a34a',
                        padding: '2px 8px', borderRadius: 99, fontWeight: 600, flexShrink: 0 }}>
                        مسجّل ✓
                      </span>
                    )}
                  </div>
                  {ws.description_ar && (
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 320 }}>
                      {ws.description_ar}
                    </p>
                  )}
                  {!enrolled && ws.discount_percent && ws.discount_percent > 0 && (
                    <div style={{ marginTop: 6, fontSize: '0.75rem', color: '#0288d1', fontWeight: 600 }}>
                      خصم {ws.discount_percent}%
                      {ws.discount_code && <span style={{ color: '#94a3b8', fontWeight: 400 }}> — كود: {ws.discount_code}</span>}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginRight: 12 }}>
                  {enrolled ? (
                    <button className="btn-primary" style={{ fontSize: '0.82rem', padding: '8px 16px' }}
                      onClick={() => openWorkshop(ws)}>
                      فتح الدورة
                    </button>
                  ) : (
                    <button className="btn-secondary" style={{ fontSize: '0.82rem', padding: '8px 16px' }}
                      disabled={enrolling === ws.id} onClick={() => enroll(ws)}>
                      {enrolling === ws.id ? '...' : 'التسجيل'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
