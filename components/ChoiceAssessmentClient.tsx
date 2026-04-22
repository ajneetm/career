'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

// ─── Radar Chart ─────────────────────────────────────────────────────────────
function RadarChart({ scores, labels, colors }: { scores: number[]; labels: string[]; colors: string[] }) {
  const size = 260, cx = size / 2, cy = size / 2, radius = 90, n = scores.length
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2
  const point = (r: number, i: number) => ({ x: cx + r * Math.cos(angle(i)), y: cy + r * Math.sin(angle(i)) })
  const dataPoints = scores.map((s, i) => point((s / 100) * radius, i))
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z'
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
      {[20, 40, 60, 80, 100].map(r => {
        const pts = Array.from({ length: n }, (_, i) => point((r / 100) * radius, i))
        const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z'
        return <path key={r} d={path} fill="none" stroke="#e2e8f0" strokeWidth="1" />
      })}
      {Array.from({ length: n }, (_, i) => {
        const outer = point(radius, i)
        return <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="#cbd5e1" strokeWidth="1" />
      })}
      <path d={dataPath} fill="rgba(30,95,220,0.12)" stroke="#1e5fdc" strokeWidth="2.5" />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={5} fill={colors[i]} stroke="white" strokeWidth="1.5" />
      ))}
      {Array.from({ length: n }, (_, i) => {
        const p = point(radius + 24, i)
        const ps = point((scores[i] / 100) * radius, i)
        return (
          <g key={i}>
            <text x={ps.x} y={ps.y - 9} textAnchor="middle" fontSize="9" fontWeight="600" fill={colors[i]}>{scores[i]}%</text>
            <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize="10" fontWeight="500" fill="#1e293b">{labels[i]}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const AXIS_NEEDS: Record<string, string[]> = {
  direction: ['اختبارات ميول مهنية', 'جلسة إرشاد مهني متخصصة', 'مقارنة 3 مجالات مهنية مختلفة', 'كتابة سبب الاختيار بشكل صريح'],
  knowledge: ['جمع معلومات واقعية عن المهنة المستهدفة', 'مقابلة أشخاص من المجال للتعرف على الواقع', 'قراءة وصف الوظائف ومتطلباتها', 'التعرف على المؤهلات والشهادات المطلوبة'],
  decision:  ['استخدام نموذج مفاضلة منطقي بين الخيارات', 'ترتيب الأولويات وفق المعطيات الحقيقية', 'تقليل التأثر بالضغط الخارجي', 'بناء بدائل واضحة في حال تغيّر الظروف'],
  skills:    ['وضع خطة لاكتساب مهارة أساسية في المجال', 'الالتحاق بتدريب قصير أو دورة عملية', 'اعتماد خطة تعلم ذاتي منظمة', 'ممارسة عملية في البيئة المهنية المستهدفة'],
  social:    ['إيجاد مرشد مهني أو شخص خبير في المجال', 'بناء بيئة داعمة ومشجعة للقرار المهني', 'توسيع شبكة العلاقات في التخصص المنشود', 'تطوير مهارة طلب المساندة بوضوح وثقة'],
  execution: ['وضع خطة 90 يوم بخطوات قابلة للتنفيذ', 'تحديد ميزانية أولية واقعية للتأهيل', 'تحويل الأهداف إلى مؤشرات قابلة للقياس', 'تجربة المجال فعليًا قبل القرار النهائي'],
}

const AXES = [
  { id: 'direction', title: 'وضوح الاتجاه المهني',          color: '#1e5fdc', questions: ['لدي تصور واضح للمهنة أو المجال الذي أميل إليه.', 'أستطيع أن أشرح بوضوح لماذا اخترت هذا المجال.', 'أميز بين ما أريده أنا فعلًا وبين ما يريده الآخرون لي.', 'أعرف ما الذي يناسب شخصيتي وقدراتي، وليس فقط ما يعجبني مؤقتًا.'] },
  { id: 'knowledge', title: 'المعرفة المهنية',               color: '#0288d1', questions: ['أعرف التخصصات أو المسارات الدراسية التي تقود إلى المهنة التي أفكر فيها.', 'لدي معلومات واقعية عن طبيعة العمل اليومي في هذا المجال.', 'أعرف المؤهلات والمهارات المطلوبة للدخول إلى هذا المجال.', 'لدي معرفة مقبولة بمستقبل هذا المجال وفرصه وتحدياته.'] },
  { id: 'decision',  title: 'اتخاذ القرار وتقليل التشتت',   color: '#7c3aed', questions: ['أستطيع المقارنة بين أكثر من خيار مهني بطريقة منطقية.', 'لا أتغير بسرعة بسبب كلام الناس أو ضغط الأسرة.', 'أعتمد على معلومات وحقائق عند الاختيار أكثر من الانطباع أو التقليد.', 'أملك بدائل واضحة إذا لم ينجح خياري الأول.'] },
  { id: 'skills',    title: 'الجاهزية المهارية',             color: '#388e3c', questions: ['أمتلك مهارة أساسية تخدمني في المجال الذي أفكر فيه.', 'أستطيع تنظيم وقتي للتعلم والتطوير.', 'أبادر للبحث عن تدريب أو تطوع أو تجربة عملية.', 'أستطيع التواصل وطرح الأسئلة والاستفادة من المرشدين أو المختصين.'] },
  { id: 'social',    title: 'الدعم الاجتماعي والإرشادي',    color: '#f57c00', questions: ['يوجد في حياتي شخص واحد على الأقل يمكنه أن يوجّهني مهنيًا.', 'أستطيع بناء علاقات إيجابية مع أشخاص في المجال الذي أطمح إليه.', 'لا أتردد في طلب المشورة أو الاستفادة من خبرات الآخرين.', 'أستطيع التعامل مع الضغوط الاجتماعية دون أن أفقد اتجاهي.'] },
  { id: 'execution', title: 'الجاهزية التنفيذية والمالية',  color: '#c62828', questions: ['لدي خطة أولية للخطوات التي سأقوم بها خلال الأشهر الستة القادمة.', 'لدي تصور واقعي لتكاليف الدراسة أو التدريب أو التأهيل المطلوب.', 'أستطيع الالتزام بخطة تطوير بسيطة وقابلة للقياس.', 'أنا مستعد لتجربة المجال فعليًا قبل اتخاذ القرار النهائي.'] },
]

const LABELS = ['لا تنطبق', 'قليلًا', 'متوسطة', 'كبيرة', 'تمامًا']

function axisLevel(score: number) {
  if (score >= 16) return { label: 'قوة واضحة',       color: '#388e3c' }
  if (score >= 11) return { label: 'جيد — يحتاج دعم', color: '#0288d1' }
  if (score >= 6)  return { label: 'فجوة تحتاج تدخل', color: '#f57c00' }
  return             { label: 'ضعف حرج',               color: '#c62828' }
}

function overallLevel(total: number) {
  if (total >= 96) return { label: 'جاهزية عالية',    desc: 'أنت مستعد لمرحلة الاختيار بمستوى عالٍ من الوضوح والجاهزية.', color: '#388e3c' }
  if (total >= 72) return { label: 'جاهزية متوسطة',   desc: 'تحتاج إلى ضبط بعض المحاور وتوجيه مركّز.', color: '#0288d1' }
  if (total >= 48) return { label: 'جاهزية ناقصة',    desc: 'الشخص متردد أو غير مكتمل الاستعداد — يحتاج دعم في عدة محاور.', color: '#f57c00' }
  return             { label: 'تحتاج بناء أساس',       desc: 'هناك حاجة لإعادة بناء الأساس المهني والمعرفي والمهاري.', color: '#c62828' }
}

// ─── Likert row (shared between mobile single-Q and desktop all-Qs) ───────────
function LikertRow({ value, color, onChange, compact }: {
  value: number; color: string; onChange: (v: number) => void; compact?: boolean
}) {
  return (
    <div className={compact ? 'ca-likert-compact' : 'ca-likert-big'}>
      {[1,2,3,4,5].map(v => (
        <button key={v} type="button"
          onClick={() => onChange(v)}
          className={`${compact ? 'ca-likert-compact-btn' : 'ca-likert-big-btn'} ${value === v ? 'active' : ''}`}
          style={value === v ? { borderColor: color, background: `${color}12`, color } : {}}
        >
          <span className={compact ? 'ca-lc-val' : 'ca-likert-big-val'}>{v}</span>
          <span className={compact ? 'ca-lc-label' : 'ca-likert-big-label'}>{LABELS[v - 1]}</span>
        </button>
      ))}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function ChoiceAssessmentClient() {
  const [axisIndex, setAxisIndex] = useState(0)
  const [qIndex,    setQIndex]    = useState(0)
  const [answers,   setAnswers]   = useState<number[]>(Array(24).fill(0))
  const [step,      setStep]      = useState<'questions' | 'loading' | 'results'>('questions')
  const [aiReport,  setAiReport]  = useState<{ strengths: string[]; weaknesses: string[]; recommendation: string } | null>(null)
  const [dir,       setDir]       = useState(1)

  const axis        = AXES[axisIndex]
  const globalIdx   = axisIndex * 4 + qIndex
  const currentAns  = answers[globalIdx]
  const isLastAxis  = axisIndex === AXES.length - 1
  const isLastQ     = qIndex === 3
  const axisAnswers = answers.slice(axisIndex * 4, axisIndex * 4 + 4)
  const axisComplete = axisAnswers.every(a => a > 0)

  const setAnswer = (qi: number, val: number) =>
    setAnswers(prev => { const n = [...prev]; n[axisIndex * 4 + qi] = val; return n })

  // ── Mobile navigation (question by question) ──────────────────────────────
  const mobileNext = () => {
    setDir(1)
    if (!isLastQ) { setQIndex(q => q + 1); return }
    if (!isLastAxis) { setAxisIndex(a => a + 1); setQIndex(0); return }
    handleSubmit()
  }
  const mobilePrev = () => {
    setDir(-1)
    if (qIndex > 0) { setQIndex(q => q - 1); return }
    if (axisIndex > 0) { setAxisIndex(a => a - 1); setQIndex(3); return }
  }

  // ── Desktop navigation (axis by axis) ─────────────────────────────────────
  const desktopNext = () => {
    setDir(1)
    if (!isLastAxis) { setAxisIndex(a => a + 1); setQIndex(0); return }
    handleSubmit()
  }
  const desktopPrev = () => {
    setDir(-1)
    if (axisIndex > 0) { setAxisIndex(a => a - 1); setQIndex(0) }
  }

  const handleSubmit = async () => {
    setStep('loading')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    try {
      const axisScores = AXES.map((_, ai) => ({
        title: AXES[ai].title,
        score: answers.slice(ai * 4, ai * 4 + 4).reduce((s, v) => s + v, 0),
      }))
      const total = axisScores.reduce((s, a) => s + a.score, 0)
      const res = await fetch('/api/assessment/choice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ axisScores, total }),
      })
      const json = await res.json()
      if (!json.error) setAiReport(json.report)
    } catch { /* fallback to static */ }
    setStep('results')
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (step === 'loading') {
    return (
      <div className="ca-page" dir="rtl">
        <div className="ca-loading">
          <div className="ca-spinner" />
          <p>الذكاء الاصطناعي يحلل نتائجك...</p>
          <span>بضع ثوانٍ فقط</span>
        </div>
      </div>
    )
  }

  // ── Results ───────────────────────────────────────────────────────────────
  if (step === 'results') {
    const axisScores  = AXES.map((_, ai) => answers.slice(ai * 4, ai * 4 + 4).reduce((s, v) => s + v, 0))
    const total       = axisScores.reduce((s, v) => s + v, 0)
    const overall     = overallLevel(total)
    const needAxes    = AXES.filter((_, i) => axisScores[i] < 16)
    const radarScores = axisScores.map(s => Math.round((s / 20) * 100))
    const strengths   = aiReport?.strengths   ?? AXES.filter((_, i) => axisScores[i] >= 16).map(a => `قوة واضحة في محور "${a.title}"`)
    const weaknesses  = aiReport?.weaknesses  ?? AXES.filter((_, i) => axisScores[i] <  16).map(a => `${axisLevel(axisScores[AXES.indexOf(a)]).label} في محور "${a.title}"`)
    const recommendation = aiReport?.recommendation ?? 'راجع محاور الضعف وابدأ بالخطوات العملية المقترحة.'

    return (
      <div className="ca-page" dir="rtl">
        <div className="ca-header" style={{ borderBottom: `4px solid ${overall.color}` }}>
          <div className="ca-header-inner">
            <div>
              <p className="ca-header-label">استبيان مرحلة الاختيار</p>
              <h1>نتائجك</h1>
            </div>
            <div className="ca-score-circle" style={{ borderColor: overall.color }}>
              <span style={{ color: overall.color }}>{total}</span>
              <small>/ 120</small>
            </div>
          </div>
        </div>

        <div className="ca-results-content">
          <motion.div className="ca-overall-badge" style={{ borderColor: overall.color, background: `${overall.color}08` }}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="ca-overall-dot" style={{ background: overall.color }} />
            <div>
              <p className="ca-badge-sub">مستوى الجاهزية الكلية</p>
              <p className="ca-badge-title" style={{ color: overall.color }}>{overall.label}</p>
              <p className="ca-badge-desc">{overall.desc}</p>
            </div>
          </motion.div>

          <div className="ca-grid">
            <motion.div className="ca-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
              <h2>الرادار المهني</h2>
              <div className="ca-radar-wrap">
                <RadarChart scores={radarScores} labels={AXES.map(a => a.title.split(' ')[0])} colors={AXES.map(a => a.color)} />
              </div>
            </motion.div>

            <motion.div className="ca-card" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
              <h2>النتائج حسب المحاور</h2>
              <div className="ca-bars">
                {AXES.map((ax, i) => {
                  const lv = axisLevel(axisScores[i])
                  return (
                    <div key={ax.id} className="ca-bar-row">
                      <div className="ca-bar-header">
                        <span className="ca-bar-dot" style={{ background: ax.color }} />
                        <span className="ca-bar-name">{ax.title}</span>
                        <span className="ca-bar-val" style={{ color: lv.color }}>{axisScores[i]}/20</span>
                      </div>
                      <div className="ca-bar-track">
                        <motion.div className="ca-bar-fill" style={{ background: ax.color }}
                          initial={{ width: 0 }} animate={{ width: `${(axisScores[i] / 20) * 100}%` }} transition={{ duration: 0.7, ease: 'easeOut' }} />
                      </div>
                      <span className="ca-bar-tag" style={{ background: `${lv.color}15`, color: lv.color }}>{lv.label}</span>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </div>

          <motion.div className="ca-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2>التقرير التفصيلي</h2>

            {strengths.length > 0 && (
              <div className="ca-report-block" style={{ borderColor: '#388e3c30', background: '#388e3c06' }}>
                <p className="ca-report-title" style={{ color: '#388e3c' }}>💪 نقاط القوة</p>
                <ul>{strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>
            )}
            {weaknesses.length > 0 && (
              <div className="ca-report-block" style={{ borderColor: '#c6282830', background: '#c6282806' }}>
                <p className="ca-report-title" style={{ color: '#c62828' }}>⚠️ نقاط الضعف</p>
                <ul>{weaknesses.map((w, i) => <li key={i}>{w}</li>)}</ul>
              </div>
            )}
            {needAxes.length > 0 && (
              <div className="ca-report-block" style={{ borderColor: '#0288d130', background: '#0288d106' }}>
                <p className="ca-report-title" style={{ color: '#0288d1' }}>📈 الاحتياج التطويري حسب المحور</p>
                {needAxes.map(ax => (
                  <div key={ax.id} className="ca-need-axis" style={{ borderColor: `${ax.color}30` }}>
                    <p className="ca-need-title" style={{ color: ax.color }}>{ax.title}</p>
                    <ul>{AXIS_NEEDS[ax.id].map((n, i) => <li key={i}>{n}</li>)}</ul>
                  </div>
                ))}
              </div>
            )}
            <div className="ca-report-block" style={{ borderColor: `${overall.color}30`, background: `${overall.color}08` }}>
              <p className="ca-report-title" style={{ color: overall.color }}>🎯 التوصية النهائية</p>
              <p className="ca-recommendation">{recommendation}</p>
            </div>
          </motion.div>

          <div className="ca-actions">
            <button onClick={() => { setStep('questions'); setAxisIndex(0); setQIndex(0); setAnswers(Array(24).fill(0)); setAiReport(null) }} className="ca-btn-outline">
              ← إعادة الاستبيان
            </button>
            <button onClick={() => window.print()} className="ca-btn-outline ca-btn-print">
              🖨️ طباعة / PDF
            </button>
            <Link href="/" className="ca-btn-primary">الرئيسية ←</Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Questions ─────────────────────────────────────────────────────────────

  // Progress bar: answered questions count (not counting current unanswered)
  const answeredCount = answers.filter(a => a > 0).length
  const progressPct   = Math.round((answeredCount / 24) * 100)

  return (
    <div className="ca-page" dir="rtl">

      {/* ══ MOBILE layout — one question at a time (hidden on desktop) ══════ */}
      <div className="ca-mobile-view">
        {/* Top bar */}
        <div className="ca-topbar" style={{ borderBottom: `3px solid ${axis.color}` }}>
          <div className="ca-topbar-inner">
            <div className="ca-progress-track">
              <div className="ca-progress-fill" style={{ width: `${progressPct}%`, background: axis.color }} />
            </div>
            <div className="ca-topbar-meta">
              <span className="ca-axis-pill-inline" style={{ color: axis.color }}>{axis.title}</span>
              <span className="ca-progress-label">{globalIdx + 1} / 24</span>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="ca-q-wrap">
          <AnimatePresence mode="wait">
            <motion.div key={globalIdx}
              initial={{ opacity: 0, x: dir * 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -dir * 30 }}
              transition={{ duration: 0.2 }}
              className="ca-q-card"
            >
              <p className="ca-q-text-big">{axis.questions[qIndex]}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Big likert */}
        <LikertRow value={currentAns} color={axis.color} onChange={v => setAnswer(qIndex, v)} />

        {/* Sticky nav */}
        <div className="ca-bottom-nav">
          {axisIndex === 0 && qIndex === 0
            ? <Link href="/" className="ca-nav-back">← رجوع</Link>
            : <button onClick={mobilePrev} className="ca-nav-back">← السابق</button>
          }
          <button onClick={mobileNext} disabled={!currentAns} className="ca-nav-next"
            style={currentAns ? { background: axis.color } : {}}>
            {isLastAxis && isLastQ ? 'عرض النتائج ←' : 'التالي ←'}
          </button>
        </div>
      </div>

      {/* ══ DESKTOP layout — full axis at once (hidden on mobile) ══════════ */}
      <div className="ca-desktop-view">
        {/* Step dots + axis label */}
        <div className="ca-desktop-header">
          <div className="ca-desktop-header-inner">
            <div className="ca-desktop-steps">
              {AXES.map((ax, i) => (
                <div key={ax.id} className={`ca-desktop-dot ${i === axisIndex ? 'active' : i < axisIndex ? 'done' : ''}`}
                  style={{ background: i <= axisIndex ? ax.color : '#e2e8f0' }} title={ax.title} />
              ))}
            </div>
            <span className="ca-desktop-counter">المحور {axisIndex + 1} من {AXES.length}</span>
          </div>
          <div className="ca-progress-track" style={{ maxWidth: 760, margin: '8px auto 0', borderRadius: 99 }}>
            <div className="ca-progress-fill" style={{ width: `${progressPct}%`, background: axis.color, borderRadius: 99 }} />
          </div>
        </div>

        {/* Axis card */}
        <div className="ca-desktop-body">
          <AnimatePresence mode="wait">
            <motion.div key={axisIndex}
              initial={{ opacity: 0, x: dir * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -dir * 24 }}
              transition={{ duration: 0.25 }}
              className="ca-desktop-card"
            >
              {/* Axis header stripe */}
              <div className="ca-desktop-axis-header" style={{ background: `${axis.color}0e`, borderBottom: `2px solid ${axis.color}22` }}>
                <div className="ca-desktop-axis-num" style={{ background: axis.color }}>{axisIndex + 1}</div>
                <div>
                  <p className="ca-desktop-axis-sub">المحور</p>
                  <p className="ca-desktop-axis-title" style={{ color: axis.color }}>{axis.title}</p>
                </div>
                {/* Legend */}
                <div className="ca-desktop-legend">
                  {[1,2,3,4,5].map(v => (
                    <span key={v}><strong>{v}</strong> {LABELS[v-1]}</span>
                  ))}
                </div>
              </div>

              {/* Questions */}
              <div className="ca-desktop-questions">
                {axis.questions.map((q, qi) => (
                  <div key={qi} className="ca-desktop-q-row">
                    <p className="ca-desktop-q-text">
                      <span className="ca-desktop-q-num" style={{ color: axis.color }}>{qi + 1}</span>
                      {q}
                    </p>
                    <LikertRow value={axisAnswers[qi]} color={axis.color} onChange={v => setAnswer(qi, v)} compact />
                  </div>
                ))}
              </div>

              {/* Nav */}
              <div className="ca-desktop-nav">
                {axisIndex === 0
                  ? <Link href="/" className="ca-btn-outline">← رجوع</Link>
                  : <button onClick={desktopPrev} className="ca-btn-outline">← السابق</button>
                }
                <button onClick={desktopNext} disabled={!axisComplete} className="ca-btn-primary"
                  style={axisComplete ? { background: axis.color } : {}}>
                  {isLastAxis ? 'عرض النتائج ←' : 'التالي ←'}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

    </div>
  )
}
