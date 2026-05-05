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

// ─── Arabic data ──────────────────────────────────────────────────────────────

const AXES_AR = [
  { id: 'direction', title: 'وضوح الاتجاه المهني',         color: '#1e5fdc', questions: ['لدي تصور واضح للمهنة أو المجال الذي أميل إليه.', 'أستطيع أن أشرح بوضوح لماذا اخترت هذا المجال.', 'أميز بين ما أريده أنا فعلًا وبين ما يريده الآخرون لي.', 'أعرف ما الذي يناسب شخصيتي وقدراتي، وليس فقط ما يعجبني مؤقتًا.'] },
  { id: 'knowledge', title: 'المعرفة المهنية',              color: '#0288d1', questions: ['أعرف التخصصات أو المسارات الدراسية التي تقود إلى المهنة التي أفكر فيها.', 'لدي معلومات واقعية عن طبيعة العمل اليومي في هذا المجال.', 'أعرف المؤهلات والمهارات المطلوبة للدخول إلى هذا المجال.', 'لدي معرفة مقبولة بمستقبل هذا المجال وفرصه وتحدياته.'] },
  { id: 'decision',  title: 'اتخاذ القرار وتقليل التشتت',  color: '#7c3aed', questions: ['أستطيع المقارنة بين أكثر من خيار مهني بطريقة منطقية.', 'لا أتغير بسرعة بسبب كلام الناس أو ضغط الأسرة.', 'أعتمد على معلومات وحقائق عند الاختيار أكثر من الانطباع أو التقليد.', 'أملك بدائل واضحة إذا لم ينجح خياري الأول.'] },
  { id: 'skills',    title: 'الجاهزية المهارية',            color: '#388e3c', questions: ['أمتلك مهارة أساسية تخدمني في المجال الذي أفكر فيه.', 'أستطيع تنظيم وقتي للتعلم والتطوير.', 'أبادر للبحث عن تدريب أو تطوع أو تجربة عملية.', 'أستطيع التواصل وطرح الأسئلة والاستفادة من المرشدين أو المختصين.'] },
  { id: 'social',    title: 'الدعم الاجتماعي والإرشادي',   color: '#f57c00', questions: ['يوجد في حياتي شخص واحد على الأقل يمكنه أن يوجّهني مهنيًا.', 'أستطيع بناء علاقات إيجابية مع أشخاص في المجال الذي أطمح إليه.', 'لا أتردد في طلب المشورة أو الاستفادة من خبرات الآخرين.', 'أستطيع التعامل مع الضغوط الاجتماعية دون أن أفقد اتجاهي.'] },
  { id: 'execution', title: 'الجاهزية التنفيذية والمالية', color: '#c62828', questions: ['لدي خطة أولية للخطوات التي سأقوم بها خلال الأشهر الستة القادمة.', 'لدي تصور واقعي لتكاليف الدراسة أو التدريب أو التأهيل المطلوب.', 'أستطيع الالتزام بخطة تطوير بسيطة وقابلة للقياس.', 'أنا مستعد لتجربة المجال فعليًا قبل اتخاذ القرار النهائي.'] },
]

const AXIS_NEEDS_AR: Record<string, string[]> = {
  direction: ['اختبارات ميول مهنية', 'جلسة إرشاد مهني متخصصة', 'مقارنة 3 مجالات مهنية مختلفة', 'كتابة سبب الاختيار بشكل صريح'],
  knowledge: ['جمع معلومات واقعية عن المهنة المستهدفة', 'مقابلة أشخاص من المجال للتعرف على الواقع', 'قراءة وصف الوظائف ومتطلباتها', 'التعرف على المؤهلات والشهادات المطلوبة'],
  decision:  ['استخدام نموذج مفاضلة منطقي بين الخيارات', 'ترتيب الأولويات وفق المعطيات الحقيقية', 'تقليل التأثر بالضغط الخارجي', 'بناء بدائل واضحة في حال تغيّر الظروف'],
  skills:    ['وضع خطة لاكتساب مهارة أساسية في المجال', 'الالتحاق بتدريب قصير أو دورة عملية', 'اعتماد خطة تعلم ذاتي منظمة', 'ممارسة عملية في البيئة المهنية المستهدفة'],
  social:    ['إيجاد مرشد مهني أو شخص خبير في المجال', 'بناء بيئة داعمة ومشجعة للقرار المهني', 'توسيع شبكة العلاقات في التخصص المنشود', 'تطوير مهارة طلب المساندة بوضوح وثقة'],
  execution: ['وضع خطة 90 يوم بخطوات قابلة للتنفيذ', 'تحديد ميزانية أولية واقعية للتأهيل', 'تحويل الأهداف إلى مؤشرات قابلة للقياس', 'تجربة المجال فعليًا قبل القرار النهائي'],
}

const LABELS_AR = ['لا تنطبق', 'قليلًا', 'متوسطة', 'كبيرة', 'تمامًا']

// ─── English data ─────────────────────────────────────────────────────────────

const AXES_EN = [
  { id: 'direction', title: 'Career Direction Clarity',       color: '#1e5fdc', questions: ['I have a clear vision of the career or field I am drawn to.', 'I can clearly explain why I chose this field.', 'I can distinguish between what I truly want and what others want for me.', 'I know what suits my personality and abilities, not just what temporarily interests me.'] },
  { id: 'knowledge', title: 'Professional Knowledge',          color: '#0288d1', questions: ['I know the specializations or study paths that lead to the career I am considering.', 'I have realistic information about the day-to-day work in this field.', 'I know the qualifications and skills required to enter this field.', 'I have adequate knowledge of this field\'s future, its opportunities and challenges.'] },
  { id: 'decision',  title: 'Decision Making & Focus',         color: '#7c3aed', questions: ['I can compare multiple career options in a logical way.', 'I don\'t change my mind quickly due to others\' opinions or family pressure.', 'I rely on information and facts when choosing, more than impressions or imitation.', 'I have clear alternatives if my first choice doesn\'t work out.'] },
  { id: 'skills',    title: 'Skills Readiness',                color: '#388e3c', questions: ['I have a core skill that supports me in the field I am considering.', 'I can organize my time for learning and development.', 'I proactively seek training, volunteering, or practical experience.', 'I can communicate, ask questions, and benefit from mentors or specialists.'] },
  { id: 'social',    title: 'Social & Mentorship Support',     color: '#f57c00', questions: ['There is at least one person in my life who can guide me professionally.', 'I can build positive relationships with people in the field I aspire to.', 'I don\'t hesitate to ask for advice or benefit from others\' experiences.', 'I can handle social pressures without losing my direction.'] },
  { id: 'execution', title: 'Execution & Financial Readiness', color: '#c62828', questions: ['I have a preliminary plan for the steps I will take over the next six months.', 'I have a realistic picture of the costs of study, training, or preparation required.', 'I can commit to a simple, measurable development plan.', 'I am ready to actually try the field before making my final decision.'] },
]

const AXIS_NEEDS_EN: Record<string, string[]> = {
  direction: ['Career interest tests', 'Specialized career counseling session', 'Compare 3 different career fields', 'Write out your reason for choosing explicitly'],
  knowledge: ['Gather realistic information about the target career', 'Meet people in the field to understand the reality', 'Read job descriptions and their requirements', 'Learn about required qualifications and certifications'],
  decision:  ['Use a logical trade-off model between options', 'Prioritize based on real data', 'Reduce the influence of external pressure', 'Build clear alternatives in case circumstances change'],
  skills:    ['Create a plan to acquire a core skill in the field', 'Enroll in a short training or practical course', 'Adopt a structured self-learning plan', 'Practice in the target professional environment'],
  social:    ['Find a career mentor or expert in the field', 'Build a supportive environment for your career decision', 'Expand your network in the desired specialty', 'Develop the skill of asking for support clearly and confidently'],
  execution: ['Create a 90-day plan with actionable steps', 'Set a realistic initial budget for qualification', 'Convert goals into measurable indicators', 'Actually try the field before making the final decision'],
}

const LABELS_EN = ['Not at all', 'Slightly', 'Moderately', 'Mostly', 'Completely']

// ─── Level helpers ────────────────────────────────────────────────────────────

function axisLevel(score: number, isAr: boolean) {
  if (score >= 16) return { label: isAr ? 'قوة واضحة'       : 'Clear Strength',           color: '#388e3c' }
  if (score >= 11) return { label: isAr ? 'جيد — يحتاج دعم' : 'Good — needs support',     color: '#0288d1' }
  if (score >= 6)  return { label: isAr ? 'فجوة تحتاج تدخل' : 'Gap — needs intervention', color: '#f57c00' }
  return             { label: isAr ? 'ضعف حرج'               : 'Critical weakness',         color: '#c62828' }
}

function overallLevel(total: number, isAr: boolean) {
  if (total >= 96) return { label: isAr ? 'جاهزية عالية'    : 'High Readiness',       desc: isAr ? 'أنت مستعد لمرحلة الاختيار بمستوى عالٍ من الوضوح والجاهزية.'                                             : 'You are ready for the Choice stage with a high level of clarity.',       color: '#388e3c' }
  if (total >= 72) return { label: isAr ? 'جاهزية متوسطة'   : 'Moderate Readiness',   desc: isAr ? 'تحتاج إلى ضبط بعض المحاور وتوجيه مركّز.'                                                               : 'You need to refine some areas with focused guidance.',                   color: '#0288d1' }
  if (total >= 48) return { label: isAr ? 'جاهزية ناقصة'    : 'Incomplete Readiness', desc: isAr ? 'الشخص متردد أو غير مكتمل الاستعداد — يحتاج دعم في عدة محاور.'                                         : 'You seem hesitant or not fully prepared — needs support in several areas.', color: '#f57c00' }
  return             { label: isAr ? 'تحتاج بناء أساس'       : 'Foundation Needed',    desc: isAr ? 'هناك حاجة لإعادة بناء الأساس المهني والمعرفي والمهاري.'                                               : 'There is a need to rebuild the professional, knowledge, and skills foundation.', color: '#c62828' }
}

// ─── Likert row ───────────────────────────────────────────────────────────────
function LikertRow({ value, color, onChange, compact, labels }: {
  value: number; color: string; onChange: (v: number) => void; compact?: boolean; labels: string[]
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
          <span className={compact ? 'ca-lc-label' : 'ca-likert-big-label'}>{labels[v - 1]}</span>
        </button>
      ))}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function ChoiceAssessmentClient() {
  const [lang,      setLang]      = useState<'ar' | 'en'>('ar')
  const [axisIndex, setAxisIndex] = useState(0)
  const [qIndex,    setQIndex]    = useState(0)
  const [answers,   setAnswers]   = useState<number[]>(Array(24).fill(0))
  const [step,      setStep]      = useState<'questions' | 'loading' | 'results'>('questions')
  const [aiReport,  setAiReport]  = useState<{ strengths: string[]; weaknesses: string[]; recommendation: string } | null>(null)
  const [dir,       setDir]       = useState(1)

  const isAr   = lang === 'ar'
  const BRAND  = '#1e5fdc'
  const AXES   = isAr ? AXES_AR   : AXES_EN
  const NEEDS  = isAr ? AXIS_NEEDS_AR : AXIS_NEEDS_EN
  const LABELS = isAr ? LABELS_AR : LABELS_EN

  const axis        = AXES[axisIndex]
  const globalIdx   = axisIndex * 4 + qIndex
  const currentAns  = answers[globalIdx]
  const isLastAxis  = axisIndex === AXES.length - 1
  const isLastQ     = qIndex === 3
  const axisAnswers = answers.slice(axisIndex * 4, axisIndex * 4 + 4)
  const axisComplete = axisAnswers.every(a => a > 0)
  const axisFirstQ  = axisIndex * 4 + 1
  const axisLastQ   = axisIndex * 4 + 4

  const setAnswer = (qi: number, val: number) =>
    setAnswers(prev => { const n = [...prev]; n[axisIndex * 4 + qi] = val; return n })

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
      const axisScores = AXES.map((ax, ai) => ({
        title: ax.title,
        score: answers.slice(ai * 4, ai * 4 + 4).reduce((s, v) => s + v, 0),
      }))
      const total = axisScores.reduce((s, a) => s + a.score, 0)
      const res = await fetch('/api/assessment/choice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ axisScores, total, language: lang }),
      })
      const json = await res.json()
      if (!json.error) setAiReport(json.report)
    } catch { /* fallback to static */ }
    setStep('results')
  }

  const resetAssessment = () => {
    setStep('questions'); setAxisIndex(0); setQIndex(0)
    setAnswers(Array(24).fill(0)); setAiReport(null)
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (step === 'loading') {
    return (
      <div className="ca-page" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="ca-loading">
          <div className="ca-spinner" />
          <p>{isAr ? 'الذكاء الاصطناعي يحلل نتائجك...' : 'AI is analyzing your results...'}</p>
          <span>{isAr ? 'بضع ثوانٍ فقط' : 'Just a few seconds'}</span>
        </div>
      </div>
    )
  }

  // ── Results ───────────────────────────────────────────────────────────────
  if (step === 'results') {
    const axisScores  = AXES.map((_, ai) => answers.slice(ai * 4, ai * 4 + 4).reduce((s, v) => s + v, 0))
    const total       = axisScores.reduce((s, v) => s + v, 0)
    const overall     = overallLevel(total, isAr)
    const needAxes    = AXES.filter((_, i) => axisScores[i] < 16)
    const radarScores = axisScores.map(s => Math.round((s / 20) * 100))
    const strengths   = aiReport?.strengths   ?? AXES.filter((_, i) => axisScores[i] >= 16).map(a => isAr ? `قوة واضحة في محور "${a.title}"` : `Clear strength in "${a.title}" axis`)
    const weaknesses  = aiReport?.weaknesses  ?? AXES.filter((_, i) => axisScores[i] <  16).map(a => `${axisLevel(axisScores[AXES.indexOf(a)], isAr).label} ${isAr ? 'في محور' : 'in'} "${a.title}"`)
    const recommendation = aiReport?.recommendation ?? (isAr ? 'راجع محاور الضعف وابدأ بالخطوات العملية المقترحة.' : 'Review weak areas and start with the suggested practical steps.')

    return (
      <div className="ca-page" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="ca-header" style={{ borderBottom: `4px solid ${overall.color}` }}>
          <div className="ca-header-inner">
            <div>
              <p className="ca-header-label">{isAr ? 'استبيان مرحلة الاختيار' : 'Choice Stage Assessment'}</p>
              <h1>{isAr ? 'نتائجك' : 'Your Results'}</h1>
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
              <p className="ca-badge-sub">{isAr ? 'مستوى الجاهزية الكلية' : 'Overall Readiness Level'}</p>
              <p className="ca-badge-title" style={{ color: overall.color }}>{overall.label}</p>
              <p className="ca-badge-desc">{overall.desc}</p>
            </div>
          </motion.div>

          <div className="ca-grid">
            <motion.div className="ca-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
              <h2>{isAr ? 'الرادار المهني' : 'Professional Radar'}</h2>
              <div className="ca-radar-wrap">
                <RadarChart scores={radarScores} labels={AXES.map(a => a.title.split(' ')[0])} colors={AXES.map(a => a.color)} />
              </div>
            </motion.div>

            <motion.div className="ca-card" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
              <h2>{isAr ? 'النتائج حسب المحاور' : 'Results by Axis'}</h2>
              <div className="ca-bars">
                {AXES.map((ax, i) => {
                  const lv = axisLevel(axisScores[i], isAr)
                  return (
                    <div key={ax.id} className="ca-bar-row">
                      <div className="ca-bar-header">
                        <span className="ca-bar-name">{ax.title}</span>
                        <span className="ca-bar-val" style={{ color: lv.color }}>{axisScores[i]}/20</span>
                      </div>
                      <div className="ca-bar-track">
                        <motion.div className="ca-bar-fill" style={{ background: lv.color }}
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
            <h2>{isAr ? 'التقرير التفصيلي' : 'Detailed Report'}</h2>

            {strengths.length > 0 && (
              <div className="ca-report-block" style={{ borderColor: '#388e3c30', background: '#388e3c06' }}>
                <p className="ca-report-title" style={{ color: '#388e3c' }}>💪 {isAr ? 'نقاط القوة' : 'Strengths'}</p>
                <ul>{strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>
            )}
            {weaknesses.length > 0 && (
              <div className="ca-report-block" style={{ borderColor: '#c6282830', background: '#c6282806' }}>
                <p className="ca-report-title" style={{ color: '#c62828' }}>⚠️ {isAr ? 'نقاط الضعف' : 'Weaknesses'}</p>
                <ul>{weaknesses.map((w, i) => <li key={i}>{w}</li>)}</ul>
              </div>
            )}
            {needAxes.length > 0 && (
              <div className="ca-report-block ca-report-neutral">
                <p className="ca-report-title ca-report-title-neutral">📈 {isAr ? 'الاحتياج التطويري حسب المحور' : 'Development Needs by Axis'}</p>
                {needAxes.map(ax => (
                  <div key={ax.id} className="ca-need-axis">
                    <p className="ca-need-title">{ax.title}</p>
                    <ul>{NEEDS[ax.id].map((n, i) => <li key={i}>{n}</li>)}</ul>
                  </div>
                ))}
              </div>
            )}
            <div className="ca-report-block ca-report-recommendation">
              <p className="ca-report-title ca-report-title-rec">🎯 {isAr ? 'التوصية النهائية' : 'Final Recommendation'}</p>
              <p className="ca-recommendation">{recommendation}</p>
            </div>
          </motion.div>

          <div className="ca-actions">
            <button onClick={resetAssessment} className="ca-btn-outline">
              {isAr ? '← إعادة الاستبيان' : '← Redo Assessment'}
            </button>
            <button onClick={() => window.print()} className="ca-btn-outline ca-btn-print">
              🖨️ {isAr ? 'طباعة / PDF' : 'Print / PDF'}
            </button>
            <Link href="/" className="ca-btn-primary">{isAr ? 'الرئيسية ←' : 'Home →'}</Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Questions ─────────────────────────────────────────────────────────────
  const answeredCount = answers.filter(a => a > 0).length
  const progressPct   = Math.round((answeredCount / 24) * 100)

  return (
    <div className="ca-page" dir={isAr ? 'rtl' : 'ltr'}>

      {/* Language toggle — top right */}
      <button
        onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
        className="ca-lang-toggle"
      >
        {lang === 'ar' ? 'EN' : 'AR'}
      </button>

      {/* ══ MOBILE ══════════════════════════════════════════════════════════ */}
      <div className="ca-mobile-view">
        <div className="ca-topbar">
          <div className="ca-topbar-inner">
            <div className="ca-progress-track">
              <div className="ca-progress-fill" style={{ width: `${progressPct}%`, background: BRAND }} />
            </div>
            <div className="ca-topbar-meta">
              <span className="ca-axis-pill-inline">{axis.title}</span>
              <span className="ca-progress-label" style={{ color: BRAND, fontWeight: 600 }}>
                {isAr ? `السؤال ${globalIdx + 1} / 24` : `Question ${globalIdx + 1} / 24`}
              </span>
            </div>
          </div>
        </div>

        <div className="ca-q-wrap">
          <AnimatePresence mode="wait">
            <motion.div key={globalIdx}
              initial={{ opacity: 0, x: dir * 30 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -dir * 30 }} transition={{ duration: 0.2 }}
              className="ca-q-card"
            >
              <p className="ca-q-text-big">{axis.questions[qIndex]}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <LikertRow value={currentAns} color={BRAND} onChange={v => setAnswer(qIndex, v)} labels={LABELS} />

        <div className="ca-bottom-nav">
          {axisIndex === 0 && qIndex === 0
            ? <Link href="/" className="ca-nav-back">{isAr ? '← رجوع' : '← Back'}</Link>
            : <button onClick={mobilePrev} className="ca-nav-back">{isAr ? '← السابق' : '← Prev'}</button>
          }
          <button onClick={mobileNext} disabled={!currentAns} className="ca-nav-next"
            style={currentAns ? { background: BRAND } : {}}>
            {isLastAxis && isLastQ
              ? (isAr ? 'عرض النتائج ←' : 'View Results →')
              : (isAr ? 'التالي ←' : 'Next →')}
          </button>
        </div>
      </div>

      {/* ══ DESKTOP ═════════════════════════════════════════════════════════ */}
      <div className="ca-desktop-view">
        <div className="ca-desktop-header">
          <div className="ca-desktop-header-inner">
            <div className="ca-desktop-steps">
              {AXES.map((ax, i) => (
                <div key={ax.id}
                  className={`ca-desktop-dot ${i === axisIndex ? 'active' : i < axisIndex ? 'done' : ''}`}
                  title={ax.title} />
              ))}
            </div>
            <div className="ca-desktop-counters">
              <span className="ca-desktop-counter-main" style={{ color: BRAND }}>
                {isAr ? `الأسئلة ${axisFirstQ}–${axisLastQ} من 24` : `Questions ${axisFirstQ}–${axisLastQ} of 24`}
              </span>
              <span className="ca-desktop-counter-sub">
                {isAr ? `المحور ${axisIndex + 1} / ${AXES.length}` : `Axis ${axisIndex + 1} / ${AXES.length}`}
              </span>
            </div>
          </div>
          <div className="ca-progress-track ca-progress-desktop">
            <div className="ca-progress-fill" style={{ width: `${progressPct}%`, background: BRAND }} />
          </div>
        </div>

        <div className="ca-desktop-body">
          <AnimatePresence mode="wait">
            <motion.div key={axisIndex}
              initial={{ opacity: 0, x: dir * 24 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -dir * 24 }} transition={{ duration: 0.25 }}
              className="ca-desktop-card"
            >
              <div className="ca-desktop-axis-header">
                <div className="ca-desktop-axis-num" style={{ background: BRAND }}>{axisIndex + 1}</div>
                <div>
                  <p className="ca-desktop-axis-sub">{isAr ? 'المحور' : 'Axis'}</p>
                  <p className="ca-desktop-axis-title">{axis.title}</p>
                </div>
                <div className="ca-desktop-legend">
                  {[1,2,3,4,5].map(v => (
                    <span key={v}><strong>{v}</strong> {LABELS[v-1]}</span>
                  ))}
                </div>
              </div>

              <div className="ca-desktop-questions">
                {axis.questions.map((q, qi) => (
                  <div key={qi} className="ca-desktop-q-row">
                    <p className="ca-desktop-q-text">
                      <span className="ca-desktop-q-num" style={{ color: BRAND }}>
                        {axisIndex * 4 + qi + 1}
                      </span>
                      {q}
                    </p>
                    <LikertRow value={axisAnswers[qi]} color={BRAND} onChange={v => setAnswer(qi, v)} compact labels={LABELS} />
                  </div>
                ))}
              </div>

              <div className="ca-desktop-nav">
                {axisIndex === 0
                  ? <Link href="/" className="ca-btn-outline">{isAr ? '← رجوع' : '← Back'}</Link>
                  : <button onClick={desktopPrev} className="ca-btn-outline">{isAr ? '← السابق' : '← Previous'}</button>
                }
                <button onClick={desktopNext} disabled={!axisComplete} className="ca-btn-primary"
                  style={axisComplete ? { background: BRAND } : {}}>
                  {isLastAxis
                    ? (isAr ? 'عرض النتائج ←' : 'View Results →')
                    : (isAr ? 'التالي ←' : 'Next →')}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

    </div>
  )
}
