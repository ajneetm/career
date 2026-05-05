'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

type Project = { id: string; title: string; description: string | null }

const PRODUCT_CRITERIA = [
  { key: 'purpose',       label: 'P — الهدف',              desc: 'هل المشروع يحل مشكلة حقيقية؟' },
  { key: 'return',        label: 'R — العائد',              desc: 'هل هناك عائد اقتصادي أو اجتماعي واضح؟' },
  { key: 'obtainability', label: 'O — إمكانية التطبيق',    desc: 'هل يمكن تنفيذ المشروع بالموارد المتاحة؟' },
  { key: 'design',        label: 'D — التصميم',             desc: 'هل التصميم والتقديم احترافي ومنظم؟' },
  { key: 'users',         label: 'U — المستخدمون',          desc: 'هل تم تحديد الجمهور المستهدف بوضوح؟' },
  { key: 'competition',   label: 'C — المنافسة',            desc: 'هل تمت دراسة المنافسين والمشاريع المشابهة؟' },
  { key: 'timeline',      label: 'T — الجدول الزمني',       desc: 'هل خطة التنفيذ واقعية ومدروسة؟' },
]

function RatingSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <input type="range" min={1} max={10} value={value || 5} onChange={e => onChange(Number(e.target.value))}
        style={{ flex: 1, accentColor: '#1e5fdc' }} />
      <span style={{ fontWeight: 700, color: '#1e5fdc', minWidth: 28, textAlign: 'center', fontSize: '1rem' }}>
        {value || '—'}
      </span>
    </div>
  )
}

export function ProjectEvalClient({ id }: { id: string }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [alreadyDone, setAlreadyDone] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)

  const [ratings, setRatings] = useState<Record<string, number>>(
    Object.fromEntries(PRODUCT_CRITERIA.map(c => [c.key + '_rating', 5]))
  )
  const [notes, setNotes] = useState<Record<string, string>>(
    Object.fromEntries(PRODUCT_CRITERIA.map(c => [c.key + '_notes', '']))
  )

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: auth }) => {
      if (!auth.user) { router.push('/login'); return }
      setUser(auth.user)

      const { data: proj, error } = await supabase
        .from('projects').select('id, title, description').eq('id', id).eq('is_active', true).maybeSingle()

      if (error || !proj) { setNotFound(true); setLoading(false); return }
      setProject(proj)

      if (proj.owner_id === auth.user.id) { setNotFound(true); setLoading(false); return }

      const res = await fetch(`/api/project-evaluations?project_id=${id}&evaluator_id=${auth.user.id}`)
      const { evaluated } = await res.json()
      setAlreadyDone(evaluated)
      setLoading(false)
    })
  }, [id, router])

  function setRating(key: string, v: number) {
    setRatings(prev => ({ ...prev, [key + '_rating']: v }))
  }
  function setNote(key: string, v: string) {
    setNotes(prev => ({ ...prev, [key + '_notes']: v }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !project) return
    setSending(true)
    await fetch('/api/project-evaluations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: project.id,
        evaluator_id: user.id,
        person_name: user.user_metadata?.name ?? user.email,
        project_name: project.title,
        ...ratings,
        ...notes,
      }),
    })
    setSending(false)
    setDone(true)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="spinner" />
    </div>
  )

  if (notFound || !project) return (
    <div dir="rtl" style={{ maxWidth: 500, margin: '80px auto', textAlign: 'center', padding: '0 20px' }}>
      <p style={{ color: '#64748b', marginBottom: 16 }}>المشروع غير متاح للتقييم أو لا يمكنك تقييم مشروعك الخاص.</p>
    </div>
  )

  return (
    <div dir="rtl" style={{ maxWidth: 680, margin: '0 auto', padding: '40px 20px 80px' }}>
      <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>تقييم مشروع</h1>
      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e5fdc', marginBottom: 24 }}>{project.title}</div>
      {project.description && (
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: 28, lineHeight: 1.7 }}>{project.description}</p>
      )}

      {alreadyDone || done ? (
        <div className="assessment-card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🏆</div>
          <p style={{ fontWeight: 600, color: '#16a34a', marginBottom: 4 }}>تم تقييمك بنجاح!</p>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>شكراً على مشاركتك</p>
        </div>
      ) : (
        <form onSubmit={submit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {PRODUCT_CRITERIA.map(c => (
              <div key={c.key} className="assessment-card" style={{ padding: '18px 20px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e293b', marginBottom: 2 }}>{c.label}</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 12 }}>{c.desc}</div>
                <RatingSlider value={ratings[c.key + '_rating']} onChange={v => setRating(c.key, v)} />
                <input type="text" value={notes[c.key + '_notes']} onChange={e => setNote(c.key, e.target.value)}
                  placeholder="ملاحظة (اختياري)"
                  style={{ marginTop: 10, width: '100%', border: '1px solid #e2e8f0', borderRadius: 8,
                    padding: '8px 12px', fontSize: '0.84rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>
            ))}

            <div style={{ background: '#eff6ff', borderRadius: 12, padding: '12px 16px', fontSize: '0.82rem', color: '#1e40af' }}>
              المجموع الكلي: <strong>{Object.values(ratings).reduce((a, b) => a + b, 0)} / 70</strong>
            </div>

            <button className="btn-primary" type="submit" disabled={sending} style={{ alignSelf: 'flex-start' }}>
              {sending ? 'جارِ الإرسال...' : 'إرسال التقييم'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
