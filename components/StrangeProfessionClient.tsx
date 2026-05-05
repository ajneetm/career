'use client'

import { useEffect, useState } from 'react'

const QUESTIONS = [
  'لماذا اخترت هذه المهنة؟',
  'أكبر التحديات في هذه المهنة؟',
  'أولى مسؤولياتك في اليوم الأول؟',
  'الإنجاز الذي ستفخر به؟',
  'أعلى مكانة وظيفية ممكنة؟',
  'خطتك بعد التقاعد من هذه المهنة؟',
]

type Profession = { id: string; name: string; code: string }

function getSessionId() {
  let id = localStorage.getItem('strange_session')
  if (!id) { id = Math.random().toString(36).slice(2) + Date.now(); localStorage.setItem('strange_session', id) }
  return id
}

export function StrangeProfessionClient({ code }: { code: string }) {
  const [phase, setPhase]       = useState<'loading' | 'not_found' | 'rating' | 'done' | 'already'>('loading')
  const [profession, setProfession] = useState<Profession | null>(null)
  const [scores, setScores]     = useState<number[]>(Array(6).fill(0))
  const [sending, setSending]   = useState(false)

  useEffect(() => {
    fetch(`/api/strange/${code}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) { setPhase('not_found'); return }
        // check localStorage for already voted
        if (localStorage.getItem(`voted_strange_${data.id}`)) { setPhase('already'); return }
        setProfession(data)
        setPhase('rating')
      })
  }, [code])

  async function submit() {
    if (!profession) return
    if (scores.some(s => s === 0)) { alert('يرجى تقييم جميع الأسئلة'); return }
    setSending(true)
    const res = await fetch('/api/strange/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profession_id: profession.id,
        session_id: getSessionId(),
        q1: scores[0], q2: scores[1], q3: scores[2],
        q4: scores[3], q5: scores[4], q6: scores[5],
      }),
    })
    const data = await res.json()
    if (data.error === 'already_voted') { setPhase('already'); return }
    localStorage.setItem(`voted_strange_${profession.id}`, '1')
    setSending(false)
    setPhase('done')
  }

  if (phase === 'loading') return (
    <div style={page}>
      <div className="spinner" />
    </div>
  )

  if (phase === 'not_found') return (
    <div style={page}>
      <div style={card}>
        <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: 12 }}>❌</div>
        <p style={{ textAlign: 'center', color: '#64748b' }}>المهنة غير موجودة أو انتهت مدتها</p>
      </div>
    </div>
  )

  if (phase === 'already') return (
    <div style={page}>
      <div style={card}>
        <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: 12 }}>⚠️</div>
        <p style={{ textAlign: 'center', fontWeight: 600, color: '#92400e' }}>قيّمت هذه المهنة مسبقاً</p>
        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', marginTop: 6 }}>شكراً على مشاركتك!</p>
      </div>
    </div>
  )

  if (phase === 'done') return (
    <div style={page}>
      <div style={card}>
        <div style={{ fontSize: '4rem', textAlign: 'center', marginBottom: 16 }}>✅</div>
        <h2 style={{ textAlign: 'center', fontWeight: 800, color: '#0f172a', fontSize: '1.3rem', marginBottom: 8 }}>شكراً لتقييمك!</h2>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>تم تسجيل صوتك بنجاح</p>
        <button onClick={() => window.location.reload()}
          style={{ marginTop: 24, width: '100%', padding: '14px', background: '#f1f5f9', border: 'none', borderRadius: 14, fontWeight: 600, cursor: 'pointer', color: '#475569', fontFamily: 'inherit' }}>
          تقييم مهنة أخرى
        </button>
      </div>
    </div>
  )

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: '#f8fafc', padding: '24px 16px 60px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ ...card, marginBottom: 0 }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🎭</div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e5fdc', lineHeight: 1.3 }}>{profession?.name}</h1>
          </div>

          {/* Questions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {QUESTIONS.map((q, i) => (
              <div key={i} style={{ background: '#f8fafc', borderRadius: 14, padding: '14px 16px', border: '1px solid #e2e8f0' }}>
                <p style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: 12 }}>
                  {i + 1}. {q}
                </p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setScores(s => { const c = [...s]; c[i] = n; return c })}
                      style={{
                        width: 44, height: 44, borderRadius: 12, border: '2px solid',
                        borderColor: scores[i] === n ? '#1e5fdc' : '#e2e8f0',
                        background: scores[i] === n ? '#1e5fdc' : 'white',
                        color: scores[i] === n ? 'white' : '#94a3b8',
                        fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                        transform: scores[i] === n ? 'scale(1.15)' : 'scale(1)',
                        transition: 'all 0.15s', fontFamily: 'inherit',
                      }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button onClick={submit} disabled={sending}
            style={{ marginTop: 24, width: '100%', padding: '16px', background: '#16a34a', color: 'white',
              border: 'none', borderRadius: 16, fontWeight: 800, fontSize: '1.05rem', cursor: 'pointer',
              fontFamily: 'inherit', opacity: sending ? 0.7 : 1 }}>
            {sending ? 'جارِ الإرسال...' : 'إرسال التقييم'}
          </button>
        </div>
      </div>
    </div>
  )
}

const page: React.CSSProperties = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: 20 }
const card: React.CSSProperties = { background: 'white', borderRadius: 24, padding: '32px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: '100%', maxWidth: 480 }
