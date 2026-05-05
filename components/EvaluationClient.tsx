'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const CRITERIA = [
  { key: 'trainer_rating',     label: 'المدرّب' },
  { key: 'interaction_rating', label: 'التفاعل والأنشطة' },
  { key: 'content_rating',     label: 'المحتوى والمادة' },
  { key: 'facilities_rating',  label: 'البيئة والتجهيزات' },
  { key: 'benefit_rating',     label: 'الفائدة العامة' },
]

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button"
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.6rem', padding: 2,
            color: n <= (hovered || value) ? '#f59e0b' : '#e2e8f0', transition: 'color 0.15s' }}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}>
          ★
        </button>
      ))}
    </div>
  )
}

export function EvaluationClient() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [evalOpen, setEvalOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)

  const [ratings, setRatings] = useState<Record<string, number>>({
    trainer_rating: 0, interaction_rating: 0, content_rating: 0,
    facilities_rating: 0, benefit_rating: 0,
  })
  const [comments, setComments] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: auth }) => {
      if (!auth.user) { router.push('/login'); return }
      setUser(auth.user)

      const [{ data: settings }, { data: myEval }] = await Promise.all([
        supabase.from('evaluation_settings').select('is_open').eq('id', 1).single(),
        supabase.from('workshop_evaluations').select('id').eq('user_id', auth.user.id).maybeSingle(),
      ])
      setEvalOpen(settings?.is_open ?? false)
      setSubmitted(!!myEval)
      setLoading(false)
    })
  }, [router])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    const allRated = CRITERIA.every(c => ratings[c.key] > 0)
    if (!allRated) { alert('يرجى تقييم جميع المعايير'); return }

    setSending(true)
    await fetch('/api/submit-evaluation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        user_name: user.user_metadata?.name ?? user.email,
        ...ratings,
        comments,
      }),
    })
    setSending(false)
    setSubmitted(true)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="spinner" />
    </div>
  )

  return (
    <div dir="rtl" style={{ maxWidth: 600, margin: '0 auto', padding: '40px 20px 80px' }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/user" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.85rem' }}>← الداشبورد</Link>
      </div>

      <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>تقييم الورشة</h1>
      <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: 28 }}>رأيك يساعدنا على التطوير</p>

      {!evalOpen ? (
        <div className="assessment-card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔒</div>
          <p style={{ color: '#94a3b8' }}>التقييم مغلق حالياً، سيُفتح في نهاية الورشة</p>
        </div>
      ) : submitted ? (
        <div className="assessment-card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
          <p style={{ fontWeight: 600, color: '#16a34a', marginBottom: 4 }}>شكراً على تقييمك!</p>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>تم حفظ ملاحظاتك بنجاح</p>
        </div>
      ) : (
        <form onSubmit={submit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {CRITERIA.map(c => (
              <div key={c.key} className="assessment-card" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>{c.label}</span>
                  <StarRating value={ratings[c.key]} onChange={v => setRatings(prev => ({ ...prev, [c.key]: v }))} />
                </div>
              </div>
            ))}

            <div className="assessment-card" style={{ padding: '16px 20px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: '#1e293b', marginBottom: 10 }}>
                ملاحظات إضافية (اختياري)
              </label>
              <textarea value={comments} onChange={e => setComments(e.target.value)} rows={4}
                placeholder="اكتب ملاحظاتك هنا..."
                style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 10,
                  padding: '10px 14px', fontSize: '0.9rem', resize: 'vertical', fontFamily: 'inherit',
                  outline: 'none', boxSizing: 'border-box' }} />
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
