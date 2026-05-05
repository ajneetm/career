'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

const QUESTIONS = [
  'لدي رؤية واضحة للمهنة التي أرغب في ممارستها مستقبلاً.',
  'لدي فهم واضح لطبيعة عملي المستقبلي.',
  'أدرك التطور والتدرج الوظيفي الذي أسعى إليه.',
  'أراجع أهدافي المهنية بانتظام.',
  'لدي تصور إيجابي وواضح لحياتي المهنية بعد التقاعد.',
  'أثق أن مساري المهني الحالي يقودني لمستقبلي المنشود.',
  'أمتلك المهارات التخصصية الأساسية للنجاح في مجالي.',
  'لدي مهارات تواصل قوية لبناء شبكة علاقات مهنية.',
  'لدي مهارات البحث عن الفرص المهنية المستقبلية.',
  'أهتم بإدارة أولوياتي للمستقبل المهني.',
  'لدي خطة واضحة لتطوير نقاط قوتي.',
  'أعرف نقاط ضعفي.',
  'لدي خطة واضحة لتحسين نقاط ضعفي.',
  'أتحمل المسؤولية الكاملة عن اختياراتي.',
  'أوازن بين الجودة والسرعة.',
  'أبني سمعة مهنية قائمة على المصداقية.',
  'أشارك خبراتي مع الآخرين.',
  'لدي رؤية لنقل خبرتي للأجيال القادمة.',
]

const AXES = ['الوعي المهني', 'التحديات والفرص', 'المهارات والسلوكيات']

type QuizType = 'pre' | 'post'
type Status = {
  pre_done: boolean; post_done: boolean; post_open: boolean
  pre_score: number | null; post_score: number | null
  pre_axes: number[] | null; post_axes: number[] | null
}

// ── Simple Radar SVG ──────────────────────────────────────────────────────────
function RadarChart({ axes, color }: { axes: number[]; color: string }) {
  const size = 180, cx = size / 2, cy = size / 2, r = 64, n = 3
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2
  const pt = (rad: number, i: number) => ({ x: cx + rad * Math.cos(angle(i)), y: cy + rad * Math.sin(angle(i)) })
  const dataPoints = axes.map((v, i) => pt((v / 5) * r, i))
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z'
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
      {[1, 2, 3, 4, 5].map(ring => {
        const pts = [0, 1, 2].map(i => pt((ring / 5) * r, i))
        const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z'
        return <path key={ring} d={path} fill="none" stroke="#e2e8f0" strokeWidth="1" />
      })}
      {[0, 1, 2].map(i => {
        const outer = pt(r, i)
        return <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="#e2e8f0" strokeWidth="1" />
      })}
      <path d={dataPath} fill={`${color}22`} stroke={color} strokeWidth="2" />
      {dataPoints.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={4} fill={color} stroke="white" strokeWidth="1.5" />)}
      {[0, 1, 2].map(i => {
        const lp = pt(r + 22, i)
        return (
          <text key={i} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="central" fontSize="9" fontWeight="600" fill="#475569">
            {AXES[i]}
          </text>
        )
      })}
    </svg>
  )
}

// ── Result Card ───────────────────────────────────────────────────────────────
function ResultCard({ score, axes, color, label }: { score: number; axes: number[]; color: string; label: string }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: '20px', border: `2px solid ${color}30` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>{label}</div>
        <div style={{ fontSize: '1.6rem', fontWeight: 900, color }}>{score.toFixed(0)}%</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <RadarChart axes={axes} color={color} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {AXES.map((ax, i) => {
          const pct = Math.round((axes[i] / 5) * 100)
          return (
            <div key={ax}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>{ax}</span>
                <span style={{ color, fontWeight: 700 }}>{pct}%</span>
              </div>
              <div style={{ background: '#f1f5f9', borderRadius: 99, height: 5 }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99 }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export function WorkshopAssessmentTab({ user, workshopId }: { user: User; workshopId: string }) {
  const [status, setStatus]     = useState<Status | null>(null)
  const [activeQuiz, setActiveQuiz] = useState<QuizType | null>(null)
  const [answers, setAnswers]   = useState<(number | null)[]>(Array(18).fill(null))
  const [saving, setSaving]     = useState(false)
  const [showResult, setShowResult] = useState<{ type: QuizType; score: number; axes: number[] } | null>(null)

  useEffect(() => {
    fetch(`/api/workshop-assessment?workshop_id=${workshopId}&user_id=${user.id}`)
      .then(r => r.json()).then(setStatus)
  }, [workshopId, user.id])

  async function submit(type: QuizType) {
    if (answers.some(a => a === null)) { alert('يرجى الإجابة على جميع الأسئلة'); return }
    setSaving(true)
    const vals = answers as number[]
    const axes = [
      +(vals.slice(0, 6).reduce((a, b) => a + b, 0) / 6).toFixed(2),
      +(vals.slice(6, 12).reduce((a, b) => a + b, 0) / 6).toFixed(2),
      +(vals.slice(12, 18).reduce((a, b) => a + b, 0) / 6).toFixed(2),
    ]
    const total_score = +(vals.reduce((a, b) => a + b, 0) / 90 * 100).toFixed(1)

    const res = await fetch('/api/workshop-assessment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, workshop_id: workshopId, user_id: user.id, user_email: user.email, answers: vals, total_score, axes }),
    })

    if (!res.ok) {
      const d = await res.json()
      if (d.error === 'already_submitted') alert('لقد أجريت هذا الاختبار من قبل')
      setSaving(false); return
    }

    setStatus(s => s ? {
      ...s,
      [`${type}_done`]: true,
      [`${type}_score`]: total_score,
      [`${type}_axes`]: axes,
    } : s)
    setShowResult({ type, score: total_score, axes })
    setActiveQuiz(null)
    setAnswers(Array(18).fill(null))
    setSaving(false)
  }

  if (!status) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>جارِ التحميل...</div>

  // ── Quiz View ───────────────────────────────────────────────────────────────
  if (activeQuiz) {
    const answered = answers.filter(a => a !== null).length
    return (
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <button onClick={() => { setActiveQuiz(null); setAnswers(Array(18).fill(null)) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '0.85rem', padding: 0 }}>
            ← رجوع
          </button>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{answered} / {QUESTIONS.length}</span>
        </div>

        {/* Progress */}
        <div style={{ background: '#f1f5f9', borderRadius: 99, height: 5, marginBottom: 20, overflow: 'hidden' }}>
          <div style={{ width: `${(answered / QUESTIONS.length) * 100}%`, height: '100%', background: activeQuiz === 'pre' ? '#ef4444' : '#1e5fdc', borderRadius: 99, transition: 'width 0.3s' }} />
        </div>

        {/* Questions */}
        {QUESTIONS.map((q, i) => (
          <div key={i} style={{ background: 'white', borderRadius: 14, padding: '16px 18px', marginBottom: 10, border: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>
              {i + 1}. {q}
            </p>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2, 3, 4, 5].map(v => (
                <button key={v} onClick={() => { const n = [...answers]; n[i] = v; setAnswers(n) }}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 10, border: '1.5px solid',
                    borderColor: answers[i] === v ? (activeQuiz === 'pre' ? '#ef4444' : '#1e5fdc') : '#e2e8f0',
                    background: answers[i] === v ? (activeQuiz === 'pre' ? '#ef4444' : '#1e5fdc') : '#f8fafc',
                    color: answers[i] === v ? 'white' : '#94a3b8',
                    fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit',
                  }}>{v}</button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#cbd5e1', marginTop: 6 }}>
              <span>أعارض بشدة</span><span>أوافق بشدة</span>
            </div>
          </div>
        ))}

        <button onClick={() => submit(activeQuiz)} disabled={saving || answers.some(a => a === null)}
          style={{
            width: '100%', padding: '16px', marginTop: 8, border: 'none', borderRadius: 14,
            background: saving || answers.some(a => a === null) ? '#cbd5e1' : (activeQuiz === 'pre' ? '#ef4444' : '#1e5fdc'),
            color: 'white', fontWeight: 800, fontSize: '1rem', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
          }}>
          {saving ? 'جارِ الحفظ...' : 'حفظ وإظهار النتيجة ✓'}
        </button>
      </div>
    )
  }

  // ── Just Done Result ────────────────────────────────────────────────────────
  if (showResult) {
    const color = showResult.type === 'pre' ? '#ef4444' : '#1e5fdc'
    const label = showResult.type === 'pre' ? 'نتيجة الاختبار القبلي' : 'نتيجة الاختبار البعدي'
    return (
      <div>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>✅</div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>تم حفظ إجاباتك بنجاح!</h3>
          <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
            {showResult.type === 'pre' ? 'ستتمكن من مقارنة تطورك في نهاية الورشة.' : 'شكراً على مشاركتك في الاختبار البعدي.'}
          </p>
        </div>
        <ResultCard score={showResult.score} axes={showResult.axes} color={color} label={label} />
        <button onClick={() => setShowResult(null)}
          style={{ width: '100%', padding: '14px', marginTop: 12, background: '#f1f5f9', border: 'none', borderRadius: 12, fontWeight: 600, color: '#475569', cursor: 'pointer', fontFamily: 'inherit' }}>
          العودة للتقييمات
        </button>
      </div>
    )
  }

  // ── Overview ────────────────────────────────────────────────────────────────
  return (
    <div>
      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>التقييمات القبلية والبعدية</h3>

      {/* Pre card */}
      <div className="assessment-card" style={{ marginBottom: 12, padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: '1.1rem' }}>📋</span>
              <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e293b' }}>الاختبار القبلي</span>
              {status.pre_done && <span style={{ fontSize: '0.68rem', background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>تم ✓</span>}
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>يُؤخذ مرة واحدة في بداية الورشة</p>
          </div>
          {status.pre_done ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ef4444' }}>{status.pre_score?.toFixed(0)}%</div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>مستوى الوعي</div>
            </div>
          ) : (
            <button className="btn-primary" style={{ fontSize: '0.82rem', padding: '9px 18px', background: '#ef4444' }}
              onClick={() => setActiveQuiz('pre')}>
              ابدأ الاختبار
            </button>
          )}
        </div>
      </div>

      {/* Post card */}
      <div className="assessment-card" style={{ marginBottom: 16, padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: '1.1rem' }}>📊</span>
              <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e293b' }}>الاختبار البعدي</span>
              {status.post_done && <span style={{ fontSize: '0.68rem', background: '#dbeafe', color: '#1e5fdc', padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>تم ✓</span>}
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>يُفتح من الأدمن في نهاية الورشة</p>
          </div>
          {status.post_done ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e5fdc' }}>{status.post_score?.toFixed(0)}%</div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>مستوى الوعي</div>
            </div>
          ) : status.post_open ? (
            <button className="btn-primary" style={{ fontSize: '0.82rem', padding: '9px 18px' }}
              onClick={() => setActiveQuiz('post')}>
              ابدأ الاختبار
            </button>
          ) : (
            <div style={{ fontSize: '0.82rem', color: '#94a3b8', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              🔒 <span>مغلق حالياً</span>
            </div>
          )}
        </div>
      </div>

      {/* Comparison if both done */}
      {status.pre_done && status.post_done && status.pre_score != null && status.post_score != null && (
        <div className="assessment-card" style={{ padding: '20px' }}>
          <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>📈 مقارنة التطور</h4>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, background: '#fef2f2', borderRadius: 12, padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 4 }}>قبل</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ef4444' }}>{status.pre_score.toFixed(0)}%</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.2rem', color: '#94a3b8' }}>←</div>
            <div style={{ flex: 1, background: '#eff6ff', borderRadius: 12, padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 4 }}>بعد</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1e5fdc' }}>{status.post_score.toFixed(0)}%</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.2rem', color: '#94a3b8' }}>←</div>
            <div style={{ flex: 1, background: '#f0fdf4', borderRadius: 12, padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 4 }}>التطور</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#16a34a' }}>
                {(status.post_score - status.pre_score) >= 0 ? '+' : ''}{(status.post_score - status.pre_score).toFixed(0)}%
              </div>
            </div>
          </div>
          {status.pre_axes && status.post_axes && (
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <ResultCard score={status.pre_score} axes={status.pre_axes} color="#ef4444" label="القبلي" />
              </div>
              <div style={{ flex: 1 }}>
                <ResultCard score={status.post_score} axes={status.post_axes} color="#1e5fdc" label="البعدي" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
