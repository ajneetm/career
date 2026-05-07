'use client'

import { useEffect, useState } from 'react'

const CRITERIA = [
  { key: 'trainer',     label: 'المدرّب' },
  { key: 'interaction', label: 'التفاعل والأنشطة' },
  { key: 'content',     label: 'المحتوى والمادة' },
  { key: 'facilities',  label: 'البيئة والتجهيزات' },
  { key: 'benefit',     label: 'الفائدة العامة' },
]

function NumberRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => {
        const selected = n === value
        const color = n <= 4 ? '#ef4444' : n <= 7 ? '#f59e0b' : '#22c55e'
        return (
          <button key={n} type="button" onClick={() => onChange(n)}
            style={{
              width: 38, height: 38, borderRadius: 8,
              border: selected ? `2px solid ${color}` : '2px solid #e2e8f0',
              background: selected ? color : 'white',
              color: selected ? 'white' : '#64748b',
              fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
              transition: 'all 0.15s', flexShrink: 0,
            }}>
            {n}
          </button>
        )
      })}
      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
        {value === 0 ? 'اختر تقييماً' : value <= 4 ? 'ضعيف' : value <= 6 ? 'مقبول' : value <= 8 ? 'جيد' : 'ممتاز'}
      </span>
    </div>
  )
}

export function PublicEvaluationClient() {
  const [evalOpen, setEvalOpen] = useState<boolean | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending]   = useState(false)

  const [participantName, setParticipantName] = useState('')
  const [ratings, setRatings] = useState<Record<string, number>>({
    trainer: 0, interaction: 0, content: 0, facilities: 0, benefit: 0,
  })
  const [notes, setNotes] = useState<Record<string, string>>({
    trainer: '', interaction: '', content: '', facilities: '', benefit: '',
  })
  const [comments, setComments] = useState('')

  useEffect(() => {
    fetch('/api/eval-status').then(r => r.json()).then(d => setEvalOpen(d.is_open))
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const allRated = CRITERIA.every(c => ratings[c.key] > 0)
    if (!allRated) { alert('يرجى تقييم جميع المعايير'); return }

    setSending(true)
    await fetch('/api/submit-evaluation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id:  null,
        user_name: participantName.trim() || 'مجهول',
        trainer_rating:     ratings.trainer,
        interaction_rating: ratings.interaction,
        content_rating:     ratings.content,
        facilities_rating:  ratings.facilities,
        benefit_rating:     ratings.benefit,
        trainer_notes:     notes.trainer,
        interaction_notes: notes.interaction,
        content_notes:     notes.content,
        facilities_notes:  notes.facilities,
        benefit_notes:     notes.benefit,
        comments,
        source: 'public',
      }),
    })
    setSending(false)
    setSubmitted(true)
  }

  if (evalOpen === null) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="spinner" />
    </div>
  )

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px 80px' }}>
      <div style={{ width: '100%', maxWidth: 620 }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📝</div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>تقييم الورشة</h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem' }}>رأيك يساعدنا على تطوير تجربتك المهنية</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 12, fontSize: '0.78rem', color: '#94a3b8' }}>
            <span><span style={{ color: '#ef4444', fontWeight: 700 }}>1-4</span> ضعيف</span>
            <span><span style={{ color: '#f59e0b', fontWeight: 700 }}>5-7</span> مقبول–جيد</span>
            <span><span style={{ color: '#22c55e', fontWeight: 700 }}>8-10</span> ممتاز</span>
          </div>
        </div>

        {!evalOpen ? (
          <div className="assessment-card" style={{ textAlign: 'center', padding: 56 }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔒</div>
            <p style={{ color: '#94a3b8', fontWeight: 600 }}>التقييم مغلق حالياً</p>
            <p style={{ color: '#cbd5e1', fontSize: '0.83rem', marginTop: 6 }}>سيُفتح في نهاية الورشة</p>
          </div>
        ) : submitted ? (
          <div className="assessment-card" style={{ textAlign: 'center', padding: 56 }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
            <p style={{ fontWeight: 700, color: '#16a34a', fontSize: '1.1rem', marginBottom: 6 }}>شكراً لك!</p>
            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>تم حفظ تقييمك بنجاح</p>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Name — optional */}
              <div className="assessment-card" style={{ padding: '16px 20px' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: 8 }}>
                  اسمك <span style={{ color: '#94a3b8', fontWeight: 400 }}>(اختياري)</span>
                </label>
                <input
                  value={participantName}
                  onChange={e => setParticipantName(e.target.value)}
                  placeholder="اكتب اسمك أو اتركه فارغاً"
                  style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '9px 12px', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Criteria */}
              {CRITERIA.map(c => (
                <div key={c.key} className="assessment-card" style={{ padding: '18px 20px' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', marginBottom: 12 }}>{c.label}</p>
                  <NumberRating
                    value={ratings[c.key]}
                    onChange={v => setRatings(prev => ({ ...prev, [c.key]: v }))}
                  />
                  <textarea
                    value={notes[c.key]}
                    onChange={e => setNotes(prev => ({ ...prev, [c.key]: e.target.value }))}
                    rows={2}
                    placeholder="ملاحظاتك على هذا المعيار... (اختياري)"
                    style={{
                      marginTop: 12, width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 10,
                      padding: '8px 12px', fontSize: '0.85rem', resize: 'vertical',
                      fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', color: '#475569',
                    }}
                  />
                </div>
              ))}

              {/* General comments */}
              <div className="assessment-card" style={{ padding: '16px 20px' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', marginBottom: 10 }}>
                  ملاحظات عامة <span style={{ color: '#94a3b8', fontWeight: 400 }}>(اختياري)</span>
                </label>
                <textarea value={comments} onChange={e => setComments(e.target.value)} rows={3}
                  placeholder="أي ملاحظات إضافية تودّ مشاركتها..."
                  style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: '0.9rem', resize: 'vertical', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <button className="btn-primary" type="submit" disabled={sending} style={{ width: '100%', padding: '14px' }}>
                {sending ? 'جارِ الإرسال...' : 'إرسال التقييم'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
