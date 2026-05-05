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

// ── Single-series radar ───────────────────────────────────────────────────────
function RadarChart({ axes, color }: { axes: number[]; color: string }) {
  const size = 200, cx = size / 2, cy = size / 2, r = 72, n = 3
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2
  const pt = (rad: number, i: number) => ({ x: cx + rad * Math.cos(angle(i)), y: cy + rad * Math.sin(angle(i)) })
  const dataPoints = axes.map((v, i) => pt((v / 5) * r, i))
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z'
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
      {[1,2,3,4,5].map(ring => {
        const pts = [0,1,2].map(i => pt((ring/5)*r, i))
        const path = pts.map((p, i) => `${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z'
        return <path key={ring} d={path} fill="none" stroke={ring===5?'#cbd5e1':'#e2e8f0'} strokeWidth="1" />
      })}
      {[0,1,2].map(i => { const o=pt(r,i); return <line key={i} x1={cx} y1={cy} x2={o.x} y2={o.y} stroke="#e2e8f0" strokeWidth="1" /> })}
      <path d={dataPath} fill={`${color}22`} stroke={color} strokeWidth="2" />
      {dataPoints.map((p,i) => <circle key={i} cx={p.x} cy={p.y} r={4} fill={color} stroke="white" strokeWidth="1.5" />)}
      {[0,1,2].map(i => {
        const lp = pt(r+24, i)
        return <text key={i} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="central" fontSize="9" fontWeight="600" fill="#475569">{AXES[i]}</text>
      })}
    </svg>
  )
}

// ── Dual-overlay comparison radar ─────────────────────────────────────────────
function ComparisonRadarChart({ preAxes, postAxes }: { preAxes: number[]; postAxes: number[] }) {
  const size = 260, cx = size / 2, cy = size / 2, r = 88, n = 3
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2
  const pt = (rad: number, i: number) => ({ x: cx + rad * Math.cos(angle(i)), y: cy + rad * Math.sin(angle(i)) })
  const pathOf = (pts: {x:number;y:number}[]) =>
    pts.map((p, i) => `${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z'

  const prePts  = preAxes.map((v, i)  => pt((v/5)*r, i))
  const postPts = postAxes.map((v, i) => pt((v/5)*r, i))

  return (
    <svg width="100%" viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible', maxWidth: 300 }}>
      {/* Grid rings */}
      {[1,2,3,4,5].map(ring => {
        const pts = [0,1,2].map(i => pt((ring/5)*r, i))
        return <path key={ring} d={pathOf(pts)} fill="none" stroke={ring===5?'#cbd5e1':'#e2e8f0'} strokeWidth="1.2" />
      })}
      {/* Axis spokes */}
      {[0,1,2].map(i => { const o=pt(r,i); return <line key={i} x1={cx} y1={cy} x2={o.x} y2={o.y} stroke="#e2e8f0" strokeWidth="1.5" /> })}

      {/* Pre — red dashed fill */}
      <path d={pathOf(prePts)} fill="rgba(239,68,68,0.12)" stroke="#ef4444" strokeWidth="2" strokeDasharray="5 3" />
      {prePts.map((p,i) => <circle key={i} cx={p.x} cy={p.y} r={5} fill="#ef4444" stroke="white" strokeWidth="2" />)}

      {/* Post — blue solid fill (on top) */}
      <path d={pathOf(postPts)} fill="rgba(30,95,220,0.15)" stroke="#1e5fdc" strokeWidth="2.5" />
      {postPts.map((p,i) => <circle key={i} cx={p.x} cy={p.y} r={5} fill="#1e5fdc" stroke="white" strokeWidth="2" />)}

      {/* Axis labels */}
      {[0,1,2].map(i => {
        const lp = pt(r+28, i)
        const preV = Math.round((preAxes[i]/5)*100)
        const postV = Math.round((postAxes[i]/5)*100)
        return (
          <g key={i}>
            <text x={lp.x} y={lp.y-7} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#374151">{AXES[i]}</text>
            <text x={lp.x} y={lp.y+7} textAnchor="middle" fontSize="8.5" fill="#ef4444">{preV}%</text>
            <text x={lp.x} y={lp.y+18} textAnchor="middle" fontSize="8.5" fill="#1e5fdc">{postV}%</text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Result card (after submit) ────────────────────────────────────────────────
function ResultCard({ score, axes, color, label }: { score: number; axes: number[]; color: string; label: string }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: '20px', border: `2px solid ${color}25` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>{label}</div>
        <div style={{ fontSize: '1.8rem', fontWeight: 900, color }}>{score.toFixed(0)}%</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
        <RadarChart axes={axes} color={color} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {AXES.map((ax, i) => {
          const pct = Math.round((axes[i]/5)*100)
          return (
            <div key={ax}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: 4 }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>{ax}</span>
                <span style={{ color, fontWeight: 700 }}>{pct}%</span>
              </div>
              <div style={{ background: '#f1f5f9', borderRadius: 99, height: 6 }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.5s' }} />
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
  const [status, setStatus]         = useState<Status | null>(null)
  const [activeQuiz, setActiveQuiz] = useState<QuizType | null>(null)
  const [answers, setAnswers]       = useState<(number|null)[]>(Array(18).fill(null))
  const [saving, setSaving]         = useState(false)
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
      +(vals.slice(0,6).reduce((a,b)=>a+b,0)/6).toFixed(2),
      +(vals.slice(6,12).reduce((a,b)=>a+b,0)/6).toFixed(2),
      +(vals.slice(12,18).reduce((a,b)=>a+b,0)/6).toFixed(2),
    ]
    const total_score = +(vals.reduce((a,b)=>a+b,0)/90*100).toFixed(1)
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
    setStatus(s => s ? { ...s, [`${type}_done`]: true, [`${type}_score`]: total_score, [`${type}_axes`]: axes } : s)
    setShowResult({ type, score: total_score, axes })
    setActiveQuiz(null)
    setAnswers(Array(18).fill(null))
    setSaving(false)
  }

  if (!status) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>جارِ التحميل...</div>

  // ── Quiz ────────────────────────────────────────────────────────────────────
  if (activeQuiz) {
    const answered  = answers.filter(a => a !== null).length
    const quizColor = activeQuiz === 'pre' ? '#ef4444' : '#1e5fdc'
    const quizLabel = activeQuiz === 'pre' ? 'الاختبار القبلي' : 'الاختبار البعدي'
    return (
      <div>
        {/* Sticky header */}
        <div style={{ position: 'sticky', top: 0, background: '#f8fafc', paddingBottom: 12, marginBottom: 8, zIndex: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <button onClick={() => { setActiveQuiz(null); setAnswers(Array(18).fill(null)) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '0.85rem', padding: '6px 0' }}>
              ← رجوع
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: quizColor, background: `${quizColor}15`, padding: '3px 10px', borderRadius: 99 }}>{quizLabel}</span>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{answered}/{QUESTIONS.length}</span>
            </div>
          </div>
          <div style={{ background: '#e2e8f0', borderRadius: 99, height: 5, overflow: 'hidden' }}>
            <div style={{ width: `${(answered/QUESTIONS.length)*100}%`, height: '100%', background: quizColor, borderRadius: 99, transition: 'width 0.3s' }} />
          </div>
        </div>

        {/* Questions */}
        {QUESTIONS.map((q, i) => (
          <div key={i} style={{ background: 'white', borderRadius: 14, padding: '16px', marginBottom: 10, border: `1.5px solid ${answers[i] !== null ? quizColor + '40' : '#e2e8f0'}` }}>
            <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', marginBottom: 14, lineHeight: 1.6 }}>
              <span style={{ color: quizColor, fontWeight: 800, marginLeft: 4 }}>{i+1}.</span> {q}
            </p>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1,2,3,4,5].map(v => (
                <button key={v} onClick={() => { const n=[...answers]; n[i]=v; setAnswers(n) }}
                  style={{ flex:1, padding:'12px 0', borderRadius:10, border:'1.5px solid', fontFamily:'inherit',
                    borderColor: answers[i]===v ? quizColor : '#e2e8f0',
                    background: answers[i]===v ? quizColor : '#f8fafc',
                    color: answers[i]===v ? 'white' : '#94a3b8',
                    fontWeight:700, fontSize:'0.95rem', cursor:'pointer' }}>
                  {v}
                </button>
              ))}
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.65rem', color:'#cbd5e1', marginTop:6 }}>
              <span>أعارض بشدة</span><span>أوافق بشدة</span>
            </div>
          </div>
        ))}

        <button onClick={() => submit(activeQuiz)} disabled={saving || answers.some(a => a===null)}
          style={{ width:'100%', padding:'16px', marginTop:8, border:'none', borderRadius:14, fontFamily:'inherit',
            background: saving||answers.some(a=>a===null) ? '#e2e8f0' : quizColor,
            color: saving||answers.some(a=>a===null) ? '#94a3b8' : 'white',
            fontWeight:800, fontSize:'1rem', cursor: answers.some(a=>a===null)||saving ? 'not-allowed' : 'pointer' }}>
          {saving ? 'جارِ الحفظ...' : `حفظ إجابات ${quizLabel} ✓`}
        </button>
      </div>
    )
  }

  // ── Just-submitted result ───────────────────────────────────────────────────
  if (showResult) {
    const color = showResult.type === 'pre' ? '#ef4444' : '#1e5fdc'
    const label = showResult.type === 'pre' ? 'نتيجة الاختبار القبلي' : 'نتيجة الاختبار البعدي'
    return (
      <div>
        <div style={{ textAlign:'center', marginBottom:20, padding:'20px', background:'white', borderRadius:16, border:'1px solid #e2e8f0' }}>
          <div style={{ fontSize:'2.5rem', marginBottom:8 }}>✅</div>
          <h3 style={{ fontSize:'1rem', fontWeight:800, color:'#0f172a', marginBottom:6 }}>تم حفظ إجاباتك!</h3>
          <p style={{ fontSize:'0.82rem', color:'#64748b', margin:0 }}>
            {showResult.type === 'pre' ? 'ستتمكن من مقارنة تطورك في نهاية الورشة.' : 'شكراً على مشاركتك في الاختبار البعدي.'}
          </p>
        </div>
        <ResultCard score={showResult.score} axes={showResult.axes} color={color} label={label} />
        <button onClick={() => setShowResult(null)}
          style={{ width:'100%', padding:'14px', marginTop:12, background:'#f1f5f9', border:'none', borderRadius:12, fontWeight:600, color:'#475569', cursor:'pointer', fontFamily:'inherit' }}>
          ← العودة للتقييمات
        </button>
      </div>
    )
  }

  // ── Overview ────────────────────────────────────────────────────────────────
  const bothDone = status.pre_done && status.post_done && status.pre_axes && status.post_axes && status.pre_score != null && status.post_score != null

  return (
    <div>
      <h3 style={{ fontSize:'0.95rem', fontWeight:700, color:'#0f172a', marginBottom:14 }}>التقييمات القبلية والبعدية</h3>

      {/* Pre card */}
      <div style={{ background:'white', borderRadius:14, padding:'16px 18px', marginBottom:10, border:`1.5px solid ${status.pre_done ? '#ef444425' : '#e2e8f0'}`, borderRight:`3px solid ${status.pre_done ? '#ef4444' : '#e2e8f0'}` }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
              <span style={{ fontSize:'1rem' }}>📋</span>
              <span style={{ fontWeight:700, fontSize:'0.9rem', color:'#1e293b' }}>الاختبار القبلي</span>
              {status.pre_done && <span style={{ fontSize:'0.65rem', background:'#fef2f2', color:'#ef4444', padding:'2px 8px', borderRadius:99, fontWeight:700 }}>تم ✓</span>}
            </div>
            <p style={{ fontSize:'0.74rem', color:'#94a3b8', margin:0 }}>مرة واحدة — بداية الورشة</p>
          </div>
          {status.pre_done ? (
            <div style={{ textAlign:'center', flexShrink:0 }}>
              <div style={{ fontSize:'1.6rem', fontWeight:900, color:'#ef4444', lineHeight:1 }}>{status.pre_score?.toFixed(0)}%</div>
              <div style={{ fontSize:'0.65rem', color:'#94a3b8', marginTop:2 }}>النتيجة</div>
            </div>
          ) : (
            <button onClick={() => setActiveQuiz('pre')}
              style={{ background:'#ef4444', color:'white', border:'none', borderRadius:10, padding:'9px 18px', fontSize:'0.82rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit', flexShrink:0 }}>
              ابدأ
            </button>
          )}
        </div>
      </div>

      {/* Post card */}
      <div style={{ background:'white', borderRadius:14, padding:'16px 18px', marginBottom:16, border:`1.5px solid ${status.post_done ? '#1e5fdc25' : '#e2e8f0'}`, borderRight:`3px solid ${status.post_done ? '#1e5fdc' : '#e2e8f0'}` }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
              <span style={{ fontSize:'1rem' }}>📊</span>
              <span style={{ fontWeight:700, fontSize:'0.9rem', color:'#1e293b' }}>الاختبار البعدي</span>
              {status.post_done && <span style={{ fontSize:'0.65rem', background:'#eff6ff', color:'#1e5fdc', padding:'2px 8px', borderRadius:99, fontWeight:700 }}>تم ✓</span>}
            </div>
            <p style={{ fontSize:'0.74rem', color:'#94a3b8', margin:0 }}>يُفتح من الأدمن — نهاية الورشة</p>
          </div>
          {status.post_done ? (
            <div style={{ textAlign:'center', flexShrink:0 }}>
              <div style={{ fontSize:'1.6rem', fontWeight:900, color:'#1e5fdc', lineHeight:1 }}>{status.post_score?.toFixed(0)}%</div>
              <div style={{ fontSize:'0.65rem', color:'#94a3b8', marginTop:2 }}>النتيجة</div>
            </div>
          ) : status.post_open ? (
            <button onClick={() => setActiveQuiz('post')}
              style={{ background:'#1e5fdc', color:'white', border:'none', borderRadius:10, padding:'9px 18px', fontSize:'0.82rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit', flexShrink:0 }}>
              ابدأ
            </button>
          ) : (
            <div style={{ fontSize:'0.78rem', color:'#94a3b8', background:'#f8fafc', border:'1px solid #e2e8f0', padding:'8px 14px', borderRadius:10, display:'flex', alignItems:'center', gap:5, flexShrink:0 }}>
              🔒 مغلق
            </div>
          )}
        </div>
      </div>

      {/* ── Comparison — merged radar ── */}
      {bothDone && status.pre_axes && status.post_axes && (
        <div style={{ background:'white', borderRadius:16, padding:'20px', border:'1px solid #e2e8f0' }}>
          <h4 style={{ fontSize:'0.9rem', fontWeight:700, color:'#0f172a', marginBottom:16 }}>📈 مقارنة التطور</h4>

          {/* Score chips */}
          <div style={{ display:'flex', gap:8, marginBottom:20 }}>
            <div style={{ flex:1, background:'#fef2f2', borderRadius:12, padding:'12px 8px', textAlign:'center' }}>
              <div style={{ fontSize:'0.65rem', color:'#94a3b8', marginBottom:3 }}>قبل</div>
              <div style={{ fontSize:'1.5rem', fontWeight:900, color:'#ef4444', lineHeight:1 }}>{status.pre_score!.toFixed(0)}%</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', color:'#cbd5e1', fontSize:'1rem' }}>→</div>
            <div style={{ flex:1, background:'#eff6ff', borderRadius:12, padding:'12px 8px', textAlign:'center' }}>
              <div style={{ fontSize:'0.65rem', color:'#94a3b8', marginBottom:3 }}>بعد</div>
              <div style={{ fontSize:'1.5rem', fontWeight:900, color:'#1e5fdc', lineHeight:1 }}>{status.post_score!.toFixed(0)}%</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', color:'#cbd5e1', fontSize:'1rem' }}>→</div>
            <div style={{ flex:1, background: (status.post_score!-status.pre_score!)>=0 ? '#f0fdf4' : '#fff1f2', borderRadius:12, padding:'12px 8px', textAlign:'center' }}>
              <div style={{ fontSize:'0.65rem', color:'#94a3b8', marginBottom:3 }}>التطور</div>
              <div style={{ fontSize:'1.5rem', fontWeight:900, color:(status.post_score!-status.pre_score!)>=0?'#16a34a':'#dc2626', lineHeight:1 }}>
                {(status.post_score!-status.pre_score!)>=0?'+':''}{(status.post_score!-status.pre_score!).toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Merged radar chart */}
          <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}>
            <ComparisonRadarChart preAxes={status.pre_axes} postAxes={status.post_axes} />
          </div>

          {/* Legend */}
          <div style={{ display:'flex', justifyContent:'center', gap:24, marginBottom:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <svg width="26" height="8"><line x1="0" y1="4" x2="26" y2="4" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2"/></svg>
              <span style={{ fontSize:'0.75rem', color:'#64748b', fontWeight:500 }}>قبل</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <svg width="26" height="8"><line x1="0" y1="4" x2="26" y2="4" stroke="#1e5fdc" strokeWidth="2.5"/></svg>
              <span style={{ fontSize:'0.75rem', color:'#64748b', fontWeight:500 }}>بعد</span>
            </div>
          </div>

          {/* Per-axis bars */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {AXES.map((ax, i) => {
              const prePct  = Math.round((status.pre_axes![i]/5)*100)
              const postPct = Math.round((status.post_axes![i]/5)*100)
              const diff    = postPct - prePct
              return (
                <div key={ax}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                    <span style={{ fontSize:'0.8rem', fontWeight:600, color:'#1e293b' }}>{ax}</span>
                    <span style={{ fontSize:'0.75rem', fontWeight:700, color: diff>=0?'#16a34a':'#dc2626', background: diff>=0?'#f0fdf4':'#fff1f2', padding:'2px 8px', borderRadius:99 }}>
                      {diff>=0?'+':''}{diff}%
                    </span>
                  </div>
                  {/* Pre bar */}
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <span style={{ fontSize:'0.65rem', color:'#ef4444', fontWeight:600, width:22, textAlign:'left', flexShrink:0 }}>قبل</span>
                    <div style={{ flex:1, background:'#f1f5f9', borderRadius:99, height:7, overflow:'hidden' }}>
                      <div style={{ width:`${prePct}%`, height:'100%', background:'#ef4444', borderRadius:99 }} />
                    </div>
                    <span style={{ fontSize:'0.65rem', color:'#ef4444', fontWeight:700, width:28, textAlign:'right', flexShrink:0 }}>{prePct}%</span>
                  </div>
                  {/* Post bar */}
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:'0.65rem', color:'#1e5fdc', fontWeight:600, width:22, textAlign:'left', flexShrink:0 }}>بعد</span>
                    <div style={{ flex:1, background:'#f1f5f9', borderRadius:99, height:7, overflow:'hidden' }}>
                      <div style={{ width:`${postPct}%`, height:'100%', background:'#1e5fdc', borderRadius:99 }} />
                    </div>
                    <span style={{ fontSize:'0.65rem', color:'#1e5fdc', fontWeight:700, width:28, textAlign:'right', flexShrink:0 }}>{postPct}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
