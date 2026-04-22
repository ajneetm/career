'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

// ─── Data ────────────────────────────────────────────────────────────────────

const AXIS_NEEDS: Record<string, string[]> = {
  direction: [
    'اختبارات ميول مهنية',
    'جلسة إرشاد مهني متخصصة',
    'مقارنة 3 مجالات مهنية مختلفة',
    'كتابة سبب الاختيار بشكل صريح',
  ],
  knowledge: [
    'جمع معلومات واقعية عن المهنة المستهدفة',
    'مقابلة أشخاص من المجال للتعرف على الواقع',
    'قراءة وصف الوظائف ومتطلباتها',
    'التعرف على المؤهلات والشهادات المطلوبة',
  ],
  decision: [
    'استخدام نموذج مفاضلة منطقي بين الخيارات',
    'ترتيب الأولويات وفق المعطيات الحقيقية',
    'تقليل التأثر بالضغط الخارجي',
    'بناء بدائل واضحة في حال تغيّر الظروف',
  ],
  skills: [
    'وضع خطة لاكتساب مهارة أساسية في المجال',
    'الالتحاق بتدريب قصير أو دورة عملية',
    'اعتماد خطة تعلم ذاتي منظمة',
    'ممارسة عملية في البيئة المهنية المستهدفة',
  ],
  social: [
    'إيجاد مرشد مهني أو شخص خبير في المجال',
    'بناء بيئة داععة ومشجعة للقرار المهني',
    'توسيع شبكة العلاقات في التخصص المنشود',
    'تطوير مهارة طلب المساندة بوضوح وثقة',
  ],
  execution: [
    'وضع خطة 90 يوم بخطوات قابلة للتنفيذ',
    'تحديد ميزانية أولية واقعية للتأهيل',
    'تحويل الأهداف إلى مؤشرات قابلة للقياس',
    'تجربة المجال فعليًا قبل القرار النهائي',
  ],
}

const AXES = [
  {
    id: 'direction',
    title: 'وضوح الاتجاه المهني',
    color: '#1e5fdc',
    questions: [
      'لدي تصور واضح للمهنة أو المجال الذي أميل إليه.',
      'أستطيع أن أشرح بوضوح لماذا اخترت هذا المجال.',
      'أميز بين ما أريده أنا فعلًا وبين ما يريده الآخرون لي.',
      'أعرف ما الذي يناسب شخصيتي وقدراتي، وليس فقط ما يعجبني مؤقتًا.',
    ],
  },
  {
    id: 'knowledge',
    title: 'المعرفة المهنية',
    color: '#0288d1',
    questions: [
      'أعرف التخصصات أو المسارات الدراسية التي تقود إلى المهنة التي أفكر فيها.',
      'لدي معلومات واقعية عن طبيعة العمل اليومي في هذا المجال.',
      'أعرف المؤهلات والمهارات المطلوبة للدخول إلى هذا المجال.',
      'لدي معرفة مقبولة بمستقبل هذا المجال وفرصه وتحدياته.',
    ],
  },
  {
    id: 'decision',
    title: 'اتخاذ القرار وتقليل التشتت',
    color: '#7c3aed',
    questions: [
      'أستطيع المقارنة بين أكثر من خيار مهني بطريقة منطقية.',
      'لا أتغير بسرعة بسبب كلام الناس أو ضغط الأسرة.',
      'أعتمد على معلومات وحقائق عند الاختيار أكثر من الانطباع أو التقليد.',
      'أملك بدائل واضحة إذا لم ينجح خياري الأول.',
    ],
  },
  {
    id: 'skills',
    title: 'الجاهزية المهارية',
    color: '#388e3c',
    questions: [
      'أمتلك مهارة أساسية تخدمني في المجال الذي أفكر فيه.',
      'أستطيع تنظيم وقتي للتعلم والتطوير.',
      'أبادر للبحث عن تدريب أو تطوع أو تجربة عملية.',
      'أستطيع التواصل وطرح الأسئلة والاستفادة من المرشدين أو المختصين.',
    ],
  },
  {
    id: 'social',
    title: 'الدعم الاجتماعي والإرشادي',
    color: '#f57c00',
    questions: [
      'يوجد في حياتي شخص واحد على الأقل يمكنه أن يوجّهني مهنيًا.',
      'أستطيع بناء علاقات إيجابية مع أشخاص في المجال الذي أطمح إليه.',
      'لا أتردد في طلب المشورة أو الاستفادة من خبرات الآخرين.',
      'أستطيع التعامل مع الضغوط الاجتماعية دون أن أفقد اتجاهي.',
    ],
  },
  {
    id: 'execution',
    title: 'الجاهزية التنفيذية والمالية',
    color: '#c62828',
    questions: [
      'لدي خطة أولية للخطوات التي سأقوم بها خلال الأشهر الستة القادمة.',
      'لدي تصور واقعي لتكاليف الدراسة أو التدريب أو التأهيل المطلوب.',
      'أستطيع الالتزام بخطة تطوير بسيطة وقابلة للقياس.',
      'أنا مستعد لتجربة المجال فعليًا قبل اتخاذ القرار النهائي.',
    ],
  },
]

const LABELS = ['لا تنطبق أبدًا', 'تنطبق قليلًا', 'تنطبق بدرجة متوسطة', 'تنطبق بدرجة كبيرة', 'تنطبق تمامًا']

// ─── Scoring helpers ──────────────────────────────────────────────────────────

function axisLevel(score: number): { label: string; color: string } {
  if (score >= 16) return { label: 'قوة واضحة', color: '#388e3c' }
  if (score >= 11) return { label: 'مستوى جيد — يحتاج دعم', color: '#0288d1' }
  if (score >= 6)  return { label: 'فجوة تحتاج تدخل', color: '#f57c00' }
  return { label: 'ضعف حرج — أولوية عاجلة', color: '#c62828' }
}

function overallLevel(total: number): { label: string; desc: string; color: string } {
  if (total >= 96) return { label: 'جاهزية عالية', desc: 'أنت مستعد لمرحلة الاختيار بمستوى عالٍ من الوضوح والجاهزية.', color: '#388e3c' }
  if (total >= 72) return { label: 'جاهزية متوسطة', desc: 'تحتاج إلى ضبط بعض المحاور وتوجيه مركّز.', color: '#0288d1' }
  if (total >= 48) return { label: 'جاهزية ناقصة', desc: 'الشخص متردد أو غير مكتمل الاستعداد — يحتاج دعم في عدة محاور.', color: '#f57c00' }
  return { label: 'تحتاج بناء أساس', desc: 'هناك حاجة لإعادة بناء الأساس المهني والمعرفي والمهاري.', color: '#c62828' }
}

interface AxisReport { axis: typeof AXES[0]; score: number; needs: string[] }

function buildReport(answers: number[]) {
  const axisScores = AXES.map((_, ai) =>
    answers.slice(ai * 4, ai * 4 + 4).reduce((s, v) => s + v, 0)
  )

  const strengths: string[] = []
  const weaknesses: string[] = []
  const weakAxes: AxisReport[] = []

  axisScores.forEach((score, i) => {
    const axis = AXES[i]
    if (score >= 16) {
      strengths.push(`لديك قوة واضحة في محور "${axis.title}"`)
    } else if (score >= 11) {
      strengths.push(`لديك مستوى جيد في "${axis.title}" مع إمكانية تطوير`)
    } else {
      const label = score >= 6 ? `فجوة في محور "${axis.title}" تحتاج تدخل` : `ضعف حرج في "${axis.title}" — أولوية عاجلة`
      weaknesses.push(label)
      weakAxes.push({ axis, score, needs: AXIS_NEEDS[axis.id] })
    }
  })

  const total = axisScores.reduce((s, v) => s + v, 0)
  const recommendation = total >= 96
    ? 'لديك استعداد ممتاز لمرحلة الاختيار. ركّز الآن على ترجمة وضوحك إلى خطوات تنفيذية محددة.'
    : total >= 72
    ? 'لديك استعداد جيد، لكنك تحتاج إلى تقوية بعض المحاور وتقليل التشتت وربط ميولك بخطوات عملية خلال 3 أشهر.'
    : total >= 48
    ? 'أنت في مرحلة تردد — ابدأ بتحديد المحاور الضعيفة وركّز عليها عمليًا قبل اتخاذ أي قرار كبير.'
    : 'تحتاج إلى إعادة بناء الأساس المهني والمعرفي. ابدأ بجلسة إرشاد مهني متخصصة كأولوية قصوى.'

  return { strengths, weaknesses, weakAxes, recommendation }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreBar({ score, max, color }: { score: number; max: number; color: string }) {
  return (
    <div style={{ background: '#f1f5f9', borderRadius: 6, height: 10, overflow: 'hidden', flex: 1 }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${(score / max) * 100}%` }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{ height: '100%', background: color, borderRadius: 6 }}
      />
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function ChoiceAssessmentClient() {
  const totalQuestions = AXES.length * 4
  const [answers, setAnswers] = useState<number[]>(Array(totalQuestions).fill(0))
  const [step, setStep] = useState<'questions' | 'loading' | 'results'>('questions')
  const [aiReport, setAiReport] = useState<{ strengths: string[]; weaknesses: string[]; needs: { axis: string; items: string[] }[]; recommendation: string } | null>(null)
  const [error, setError] = useState('')

  const answered = answers.filter(a => a > 0).length
  const progress = (answered / totalQuestions) * 100

  const handleSubmit = async () => {
    const first = answers.findIndex(a => a === 0)
    if (first !== -1) {
      setError(`يرجى الإجابة على السؤال ${first + 1}`)
      document.getElementById(`cq-${first}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setError('')
    setStep('loading')
    window.scrollTo({ top: 0, behavior: 'smooth' })

    try {
      const axisScores = AXES.map((axis, ai) => ({
        title: axis.title,
        score: answers.slice(ai * 4, ai * 4 + 4).reduce((s, v) => s + v, 0),
      }))
      const total = axisScores.reduce((s, a) => s + a.score, 0)

      const res = await fetch('/api/assessment/choice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ axisScores, total }),
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setAiReport(json.report)
    } catch (e: any) {
      // fallback to static report on AI failure
      setAiReport(null)
    }
    setStep('results')
  }

  // ── Loading screen ────────────────────────────────────────────────────────
  if (step === 'loading') {
    return (
      <div className="assessment-page" dir="rtl">
        <div className="assessment-header">
          <div className="assessment-header-inner">
            <div><h1>استبيان مرحلة الاختيار</h1></div>
          </div>
        </div>
        <div className="assessment-content">
          <div className="submitting-screen">
            <div className="spinner" />
            <p>الذكاء الاصطناعي يحلل نتائجك ويكتب تقريرك المخصص...</p>
            <p className="submitting-sub">بضع ثوانٍ فقط</p>
          </div>
        </div>
      </div>
    )
  }

  // ── Results view ──────────────────────────────────────────────────────────
  if (step === 'results') {
    const axisScores = AXES.map((_, ai) =>
      answers.slice(ai * 4, ai * 4 + 4).reduce((s, v) => s + v, 0)
    )
    const total = axisScores.reduce((s, v) => s + v, 0)
    const overall = overallLevel(total)
    const staticReport = buildReport(answers)
    const report = aiReport ?? {
      strengths: staticReport.strengths,
      weaknesses: staticReport.weaknesses,
      needs: staticReport.weakAxes.map(w => ({ axis: w.axis.title, items: w.needs })),
      recommendation: staticReport.recommendation,
    }

    return (
      <div className="result-page" dir="rtl">
        <div className="result-header" style={{ borderBottom: `4px solid ${overall.color}` }}>
          <div className="result-header-inner">
            <div>
              <p className="result-label">نتائج استبيان مرحلة الاختيار</p>
              <h1>تقرير الجاهزية المهنية</h1>
            </div>
            <div className="overall-circle" style={{ borderColor: overall.color }}>
              <span style={{ color: overall.color, fontSize: '1.6rem' }}>{total}</span>
              <small>من 120</small>
            </div>
          </div>
        </div>

        <div className="result-content">

          {/* Overall level */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="stage-badge" style={{ borderColor: overall.color, background: `${overall.color}10` }}>
            <div className="stage-letter" style={{ background: overall.color, fontSize: '1rem', minWidth: 40, height: 40 }}>
              {total}
            </div>
            <div>
              <p className="stage-badge-label">مستوى الجاهزية الكلية</p>
              <p className="stage-badge-title" style={{ color: overall.color }}>{overall.label}</p>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 4 }}>{overall.desc}</p>
            </div>
          </motion.div>

          {/* Axes scores */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="result-card" style={{ marginBottom: 20 }}>
            <h2 style={{ marginBottom: 20 }}>النتائج حسب المحاور</h2>
            <div className="scores-list">
              {AXES.map((axis, i) => {
                const score = axisScores[i]
                const level = axisLevel(score)
                return (
                  <div key={axis.id} className="score-row">
                    <div className="score-row-header">
                      <div className="score-dot" style={{ background: axis.color }} />
                      <span className="score-name">{axis.title}</span>
                      <span className="score-val" style={{ color: level.color }}>{score} / 20</span>
                    </div>
                    <ScoreBar score={score} max={20} color={axis.color} />
                    <span className="current-tag" style={{ background: `${level.color}15`, color: level.color }}>
                      {level.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Report */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="result-card" style={{ marginBottom: 20 }}>
            <h2 style={{ marginBottom: 20 }}>التقرير التفصيلي</h2>

            {report.strengths.length > 0 && (
              <div style={{ borderRadius: 12, border: '1.5px solid #388e3c25', background: '#388e3c06', padding: '16px 18px', marginBottom: 14 }}>
                <p style={{ fontWeight: 700, fontSize: '0.88rem', color: '#388e3c', marginBottom: 10 }}>💪 نقاط القوة</p>
                <ul style={{ margin: 0, paddingInlineStart: 20 }}>
                  {report.strengths.map((s, i) => (
                    <li key={i} style={{ fontSize: '0.87rem', color: '#334155', lineHeight: 1.8 }}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {report.weaknesses.length > 0 && (
              <div style={{ borderRadius: 12, border: '1.5px solid #c6282825', background: '#c6282806', padding: '16px 18px', marginBottom: 14 }}>
                <p style={{ fontWeight: 700, fontSize: '0.88rem', color: '#c62828', marginBottom: 10 }}>⚠️ نقاط الضعف</p>
                <ul style={{ margin: 0, paddingInlineStart: 20 }}>
                  {report.weaknesses.map((w, i) => (
                    <li key={i} style={{ fontSize: '0.87rem', color: '#334155', lineHeight: 1.8 }}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Per-axis needs */}
            {report.needs.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <p style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0288d1', marginBottom: 12 }}>📈 الاحتياج التطويري حسب المحور</p>
                {report.needs.map((n, ni) => {
                  const axis = AXES.find(a => a.title === n.axis) ?? AXES[ni % AXES.length]
                  return (
                    <div key={ni} style={{ borderRadius: 10, border: `1.5px solid ${axis.color}25`, background: `${axis.color}06`, padding: '12px 16px', marginBottom: 10 }}>
                      <p style={{ fontWeight: 700, fontSize: '0.84rem', color: axis.color, marginBottom: 8 }}>{n.axis}</p>
                      <ul style={{ margin: 0, paddingInlineStart: 20 }}>
                        {n.items.map((item, i) => (
                          <li key={i} style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.8 }}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            )}

            <div style={{ borderRadius: 12, background: `${overall.color}10`, border: `1.5px solid ${overall.color}30`, padding: '16px 18px' }}>
              <p style={{ fontWeight: 700, fontSize: '0.85rem', color: overall.color, marginBottom: 8 }}>🎯 التوصية النهائية</p>
              <p style={{ fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.8 }}>{report.recommendation}</p>
            </div>
          </motion.div>

          <div className="result-actions">
            <button onClick={() => { setStep('questions'); setAiReport(null); setAnswers(Array(totalQuestions).fill(0)) }} className="btn-secondary">
              ← إعادة الاستبيان
            </button>
            <Link href="/" className="btn-primary">الصفحة الرئيسية ←</Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Questions view (step === 'questions') ────────────────────────────────
  return (
    <div className="assessment-page" dir="rtl">
      <div className="assessment-header">
        <div className="assessment-header-inner">
          <div>
            <h1>استبيان مرحلة الاختيار</h1>
            <p>قياس جاهزية الشخص لاختيار مساره المهني الأنسب</p>
          </div>
        </div>
      </div>

      <div className="assessment-content">
        {/* Progress */}
        <div className="progress-bar-wrap">
          <div className="progress-bar-inner" style={{ width: `${progress}%` }} />
        </div>
        <p className="progress-label">{answered} / {totalQuestions} سؤال</p>

        {/* Scale legend */}
        <div className="assessment-card instructions">
          <p>قيّم كل عبارة من <strong>1</strong> (لا تنطبق أبدًا) إلى <strong>5</strong> (تنطبق تمامًا)</p>
        </div>

        {/* Axes */}
        {AXES.map((axis, ai) => (
          <motion.div key={axis.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ai * 0.05 }}
            className="assessment-card section-card">
            <h3 className="section-title">
              <span className="section-number" style={{ background: axis.color }}>{ai + 1}</span>
              {axis.title}
            </h3>
            {axis.questions.map((q, qi) => {
              const idx = ai * 4 + qi
              return (
                <div key={qi} id={`cq-${idx}`} className="question-item">
                  <p className="question-text">
                    <span className="q-num">{idx + 1}.</span>
                    {q}
                  </p>
                  <div className="likert-scale">
                    {[1, 2, 3, 4, 5].map(val => (
                      <button key={val}
                        onClick={() => setAnswers(prev => { const n = [...prev]; n[idx] = val; return n })}
                        className={`likert-btn ${answers[idx] === val ? 'selected' : ''}`}
                        title={LABELS[val - 1]}>
                        <span className="likert-val">{val}</span>
                        <span className="likert-label">{LABELS[val - 1]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </motion.div>
        ))}

        {error && <p className="error-msg">{error}</p>}

        <div className="assessment-actions">
          <Link href="/" className="btn-secondary">← رجوع</Link>
          <button onClick={handleSubmit} className="btn-primary">عرض النتائج ←</button>
        </div>
      </div>
    </div>
  )
}
