'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

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
        const p = point(radius + 26, i)
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

type RKey = 'R' | 'I' | 'A' | 'S' | 'E' | 'C'

const TYPES: { key: RKey; ar: string; en: string; color: string; job_ar: string; job_en: string }[] = [
  { key: 'R', ar: 'واقعي',       en: 'Realistic',     color: '#f59e0b', job_ar: 'فني / مهندس',          job_en: 'Technician / Engineer'    },
  { key: 'I', ar: 'بحثي',        en: 'Investigative', color: '#3b82f6', job_ar: 'باحث / محلل',           job_en: 'Researcher / Analyst'     },
  { key: 'A', ar: 'إبداعي',      en: 'Artistic',      color: '#8b5cf6', job_ar: 'مصمم / فنان',           job_en: 'Designer / Artist'        },
  { key: 'S', ar: 'اجتماعي',     en: 'Social',        color: '#10b981', job_ar: 'مدرب / مرشد',           job_en: 'Trainer / Counselor'      },
  { key: 'E', ar: 'قيادي',       en: 'Enterprising',  color: '#ef4444', job_ar: 'قائد / رائد أعمال',     job_en: 'Leader / Entrepreneur'    },
  { key: 'C', ar: 'تقليدي',      en: 'Conventional',  color: '#64748b', job_ar: 'محاسب / إداري',         job_en: 'Accountant / Administrator'},
]

const QUESTIONS: { ar: string; en: string; type: RKey }[] = [
  { ar: 'أحب العمل بيدي في إصلاح الأجهزة أو الآلات.',         en: 'I enjoy working with my hands to fix devices or machines.',            type: 'R' },
  { ar: 'أفضل العمل في الهواء الطلق بدلاً من المكاتب.',        en: 'I prefer working outdoors rather than in offices.',                    type: 'R' },
  { ar: 'أهتم بتشغيل وصيانة المعدات الميكانيكية.',              en: 'I am interested in operating and maintaining mechanical equipment.',    type: 'R' },
  { ar: 'أستمتع ببناء الأشياء باستخدام أدوات حقيقية.',          en: 'I enjoy building things using real tools.',                            type: 'R' },
  { ar: 'أحب تحليل البيانات وحل المشكلات المعقدة.',             en: 'I enjoy analyzing data and solving complex problems.',                  type: 'I' },
  { ar: 'أستمتع بالبحث العلمي وفهم كيفية عمل الأشياء.',         en: 'I enjoy scientific research and understanding how things work.',        type: 'I' },
  { ar: 'أفضل المهن التي تتطلب تفكيراً منطقياً وعميقاً.',       en: 'I prefer careers that require logical and deep thinking.',              type: 'I' },
  { ar: 'أحب قراءة المجلات العلمية والتقنية.',                  en: 'I enjoy reading scientific and technical journals.',                    type: 'I' },
  { ar: 'أعبر عن نفسي من خلال الرسم أو الكتابة أو الموسيقى.', en: 'I express myself through drawing, writing, or music.',                 type: 'A' },
  { ar: 'أحب العمل في بيئة غير روتينية تسمح بالإبداع.',        en: 'I enjoy working in a creative, non-routine environment.',              type: 'A' },
  { ar: 'أهتم بالتصميم الجرافيكي أو الفنون البصرية.',           en: 'I am interested in graphic design or visual arts.',                    type: 'A' },
  { ar: 'أحب ابتكار أفكار جديدة وغير مألوفة.',                 en: 'I enjoy innovating new and unconventional ideas.',                     type: 'A' },
  { ar: 'أحب مساعدة الآخرين في حل مشكلاتهم الشخصية.',          en: 'I enjoy helping others solve their personal problems.',                 type: 'S' },
  { ar: 'أستمتع بتدريب الآخرين أو شرح الدروس لهم.',            en: 'I enjoy training others or explaining lessons to them.',               type: 'S' },
  { ar: 'أفضل العمل ضمن فريق لخدمة المجتمع.',                  en: 'I prefer working in a team to serve the community.',                   type: 'S' },
  { ar: 'أعتبر نفسي مستمعاً جيداً للآخرين.',                   en: 'I consider myself a good listener.',                                   type: 'S' },
  { ar: 'أستمتع بإقناع الآخرين بوجهة نظري.',                   en: 'I enjoy persuading others with my viewpoint.',                         type: 'E' },
  { ar: 'أحب تولي مسؤولية قيادة المشاريع.',                    en: 'I enjoy taking responsibility for leading projects.',                   type: 'E' },
  { ar: 'أطمح للعمل في مجالات التجارة والمبيعات.',              en: 'I aspire to work in business and sales.',                              type: 'E' },
  { ar: 'أهتم بالمكانة الاجتماعية والتأثير في الآخرين.',        en: 'I care about social status and influencing others.',                   type: 'E' },
  { ar: 'أحب تنظيم الملفات والبيانات بدقة.',                   en: 'I enjoy organizing files and data accurately.',                        type: 'C' },
  { ar: 'أفضل اتباع تعليمات واضحة وجداول محددة.',               en: 'I prefer following clear instructions and specific schedules.',        type: 'C' },
  { ar: 'أجيد التعامل مع الأرقام والتدقيق المحاسبي.',           en: 'I am good at working with numbers and accounting.',                    type: 'C' },
  { ar: 'أهتم بالتفاصيل الصغيرة في أي عمل أقوم به.',           en: 'I pay attention to small details in any work I do.',                  type: 'C' },
]

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxfLg8viBBbNjXVqY6wEtdiK4V4NBVue7uz-3EbrLaDk-I8Q3_q32xbAUeFnSPYOfBt/exec'

const LIKERT_AR = ['لا أحب إطلاقاً', 'قليلاً', 'متوسط', 'أحب', 'أحب جداً']
const LIKERT_EN = ['Strongly Dislike', 'Dislike', 'Neutral', 'Like', 'Strongly Like']

type Phase = 'info' | 'quiz' | 'loading' | 'results'

// ─── Component ────────────────────────────────────────────────────────────────
export function InterestsClient() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const isAr = lang === 'ar'
  const dir = isAr ? 'rtl' : 'ltr'

  const [phase, setPhase] = useState<Phase>('info')
  const [name, setName]     = useState('')
  const [phone, setPhone]   = useState('')
  const [age, setAge]       = useState('15 - 22')
  const [status, setStatus] = useState(isAr ? 'طالب' : 'Student')
  const [error, setError]   = useState('')

  const [idx, setIdx]       = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(Array(QUESTIONS.length).fill(null))

  const [scores, setScores]     = useState<Record<RKey, number>>({ R:0, I:0, A:0, S:0, E:0, C:0 })
  const [topCode, setTopCode]   = useState('')
  const [topJobs, setTopJobs]   = useState('')

  // ── Validation ──────────────────────────────────────────────────────────────
  function startSurvey() {
    if (!name.trim()) { setError(isAr ? 'الرجاء إدخال اسمك.' : 'Please enter your name.'); return }
    if (!/^[3567]\d{7}$/.test(phone)) { setError(isAr ? 'رقم الجوال غير صحيح (8 أرقام، يبدأ بـ 3 5 6 أو 7).' : 'Invalid phone number (8 digits, starts with 3 5 6 or 7).'); return }
    setError('')
    setPhase('quiz')
  }

  // ── Answer + navigate ────────────────────────────────────────────────────────
  function pick(val: number) {
    const next = [...answers]
    next[idx] = val
    setAnswers(next)
    if (idx < QUESTIONS.length - 1) {
      setTimeout(() => setIdx(i => i + 1), 180)
    }
  }

  function prev() { if (idx > 0) setIdx(i => i - 1) }

  function submit() {
    if (answers[idx] === null) { return }
    setPhase('loading')

    const s: Record<RKey, number> = { R:0, I:0, A:0, S:0, E:0, C:0 }
    QUESTIONS.forEach((q, i) => { s[q.type] += (answers[i] ?? 0) })

    const sorted = (Object.entries(s) as [RKey, number][]).sort((a,b) => b[1] - a[1])
    const code   = sorted.slice(0, 3).map(([k]) => k).join('-')
    const jobs   = sorted.slice(0, 3).map(([k]) => isAr ? TYPES.find(t=>t.key===k)!.job_ar : TYPES.find(t=>t.key===k)!.job_en).join(' | ')

    const params: Record<string, string> = {
      userName: name, userPhone: phone, userAge: age, userStatus: status,
      code, jobs,
      R: String(s.R), I: String(s.I), A: String(s.A), S: String(s.S), E: String(s.E), C: String(s.C),
    }
    const qs = Object.entries(params).map(([k,v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')
    fetch(SCRIPT_URL + '?' + qs, { method: 'POST', mode: 'no-cors' }).catch(() => {})

    // حفظ في Supabase ثم توجيه لـ /my-reports
    supabase.auth.getUser().then(({ data: auth }) => {
      fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: auth.user?.id ?? null,
          email: auth.user?.email ?? name,
          name,
          survey_type: 'riasec',
          total_score: Math.round((Object.values(s).reduce((a,b) => a+b, 0) / 120) * 100),
          modal_scores: { ...s, code, jobs },
          language: lang,
        }),
      }).then(() => {
        setTimeout(() => { window.location.href = '/my-reports' }, 1600)
      }).catch(() => {
        setTimeout(() => {
          setScores(s); setTopCode(code); setTopJobs(jobs); setPhase('results')
        }, 1600)
      })
    })
  }

  // ── Radar data ───────────────────────────────────────────────────────────────
  const radarScores  = useMemo(() => TYPES.map(t => Math.round((scores[t.key] / 20) * 100)), [scores])
  const radarLabels  = TYPES.map(t => isAr ? t.ar : t.en)
  const radarColors  = TYPES.map(t => t.color)

  const progress = ((idx + 1) / QUESTIONS.length) * 100
  const q = QUESTIONS[idx]

  const ageopts_ar   = ['15 - 22', '22 - 25', '25 - 30', '30 - 40', '40 فأكثر']
  const ageopts_en   = ['15 - 22', '22 - 25', '25 - 30', '30 - 40', '40+']
  const statusopts_ar = ['طالب', 'باحث عن عمل', 'موظف', 'رائد أعمال']
  const statusopts_en = ['Student', 'Job Seeker', 'Employed', 'Entrepreneur']

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="ca-page" dir={dir} lang={lang}>

      {/* ── Header ── */}
      <div className="ca-desktop-header">
        <div className="ca-desktop-header-inner" style={{ maxWidth: 680 }}>
          <div>
            <div className="ca-header-label">{isAr ? 'اكتشف ميولك المهنية' : 'Career Interest Assessment'}</div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>RIASEC</div>
          </div>
          <button className="ca-lang-toggle" onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}>
            {isAr ? 'EN' : 'عربي'}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* ══ INFO ══════════════════════════════════════════════════════════════ */}
        {phase === 'info' && (
          <motion.div key="info" className="assessment-content" style={{ maxWidth: 560 }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="assessment-card">
              <h2 style={{ fontSize: '1.15rem', marginBottom: 4 }}>
                {isAr ? 'معلوماتك الشخصية' : 'Your Information'}
              </h2>
              <p className="section-hint">{isAr ? '24 سؤال · 5 دقائق تقريباً' : '24 questions · approx. 5 minutes'}</p>

              <div className="form-grid">
                <div className="form-field">
                  <label>{isAr ? 'الاسم بالكامل' : 'Full Name'}</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder={isAr ? 'مثال: أحمد محمد' : 'e.g. John Smith'} />
                </div>
                <div className="form-field">
                  <label>{isAr ? 'رقم الجوال (قطر)' : 'Phone (Qatar)'}</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="3xxx xxxx" dir="ltr" inputMode="tel" />
                </div>
                <div className="form-field">
                  <label>{isAr ? 'الفئة العمرية' : 'Age Group'}</label>
                  <select value={age} onChange={e => setAge(e.target.value)}>
                    {(isAr ? ageopts_ar : ageopts_en).map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>{isAr ? 'الحالة الوظيفية' : 'Employment Status'}</label>
                  <select value={status} onChange={e => setStatus(e.target.value)}>
                    {(isAr ? statusopts_ar : statusopts_en).map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>

              {error && <p className="error-msg">{error}</p>}

              <button className="btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={startSurvey}>
                {isAr ? 'ابدأ الاختبار الآن' : 'Start the Assessment'}
              </button>
            </div>
          </motion.div>
        )}

        {/* ══ QUIZ ══════════════════════════════════════════════════════════════ */}
        {phase === 'quiz' && (
          <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

            {/* Progress bar */}
            <div className="ca-topbar">
              <div className="ca-topbar-inner" style={{ maxWidth: 560 }}>
                <div className="ca-progress-track">
                  <motion.div className="ca-progress-fill"
                    style={{ background: 'linear-gradient(90deg,#1e5fdc,#38bdf8)', width: `${progress}%` }}
                    animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
                </div>
                <div className="ca-topbar-meta">
                  <span className="ca-progress-label">
                    {isAr ? `سؤال ${idx + 1} من ${QUESTIONS.length}` : `Question ${idx + 1} of ${QUESTIONS.length}`}
                  </span>
                  <span className="ca-axis-pill-inline" style={{ color: TYPES.find(t=>t.key===q.type)!.color }}>
                    {isAr ? TYPES.find(t=>t.key===q.type)!.ar : TYPES.find(t=>t.key===q.type)!.en}
                  </span>
                </div>
              </div>
            </div>

            {/* Question card */}
            <div className="ca-q-wrap" style={{ maxWidth: 560 }}>
              <AnimatePresence mode="wait">
                <motion.div key={idx} className="ca-q-card"
                  initial={{ opacity: 0, x: isAr ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}>
                  <p className="ca-q-text-big" style={{ textAlign: 'center' }}>
                    {isAr ? q.ar : q.en}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Likert scale */}
            <div className="ca-likert-big" style={{ maxWidth: 560 }}>
              {[1,2,3,4,5].map(v => (
                <button key={v} className={`ca-likert-big-btn${answers[idx] === v ? ' active' : ''}`}
                  style={answers[idx] === v ? { borderColor: TYPES.find(t=>t.key===q.type)!.color, color: TYPES.find(t=>t.key===q.type)!.color } : {}}
                  onClick={() => pick(v)}>
                  <span className="ca-likert-big-val">{v}</span>
                  <span className="ca-likert-big-label">{(isAr ? LIKERT_AR : LIKERT_EN)[v-1]}</span>
                </button>
              ))}
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', maxWidth:560, margin:'6px auto 0', padding:'0 20px', fontSize:'0.78rem', fontWeight:600, color:'#94a3b8' }}>
              <span>{isAr ? 'لا أحب إطلاقاً' : 'Strongly Dislike'}</span>
              <span>{isAr ? 'أحب جداً' : 'Strongly Like'}</span>
            </div>

            {/* Nav */}
            <div className="ca-bottom-nav">
              {idx > 0
                ? <button className="ca-nav-back" onClick={prev}>{isAr ? '→ السابق' : '← Back'}</button>
                : <Link href="/" className="ca-nav-back">{isAr ? 'إلغاء' : 'Cancel'}</Link>
              }
              {idx < QUESTIONS.length - 1
                ? <button className="ca-nav-next"
                    style={{ background: answers[idx] !== null ? '#1e5fdc' : undefined }}
                    disabled={answers[idx] === null}
                    onClick={() => setIdx(i => i + 1)}>
                    {isAr ? 'التالي' : 'Next'}
                  </button>
                : <button className="ca-nav-next"
                    style={{ background: answers[idx] !== null ? '#1e5fdc' : undefined }}
                    disabled={answers[idx] === null}
                    onClick={submit}>
                    {isAr ? 'عرض النتائج' : 'Show Results'}
                  </button>
              }
            </div>
          </motion.div>
        )}

        {/* ══ LOADING ═══════════════════════════════════════════════════════════ */}
        {phase === 'loading' && (
          <motion.div key="loading" className="ca-loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="ca-spinner" />
            <p>{isAr ? 'جارِ تحليل ميولك...' : 'Analyzing your interests...'}</p>
            <span>{isAr ? 'لحظة من فضلك' : 'Just a moment'}</span>
          </motion.div>
        )}

        {/* ══ RESULTS ═══════════════════════════════════════════════════════════ */}
        {phase === 'results' && (
          <motion.div key="results" className="ca-results-content"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

            {/* Code badge */}
            <div className="ca-overall-badge" style={{ borderColor: '#1e5fdc', background: '#eff6ff' }}>
              <div className="ca-overall-dot" style={{ background: '#1e5fdc' }} />
              <div>
                <div className="ca-badge-sub">{isAr ? 'كود الميول المهنية' : 'Career Interest Code'}</div>
                <div className="ca-badge-title" style={{ fontSize: '1.4rem', letterSpacing: 4, color: '#1e5fdc' }}>{topCode}</div>
                <div className="ca-badge-desc">{isAr ? `المهن المقترحة: ${topJobs}` : `Suggested Careers: ${topJobs}`}</div>
              </div>
            </div>

            {/* Grid: radar + bars */}
            <div className="ca-grid">
              <div className="ca-card" style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                <h2>{isAr ? 'مخطط الميول' : 'Interest Profile'}</h2>
                <div className="ca-radar-wrap">
                  <RadarChart scores={radarScores} labels={radarLabels} colors={radarColors} />
                </div>
              </div>

              <div className="ca-card">
                <h2>{isAr ? 'تفاصيل الأبعاد' : 'Dimension Scores'}</h2>
                <div className="ca-bars">
                  {TYPES.map(t => {
                    const pct = Math.round((scores[t.key] / 20) * 100)
                    return (
                      <div key={t.key} className="ca-bar-row">
                        <div className="ca-bar-header">
                          <div className="ca-bar-dot" style={{ background: t.color }} />
                          <span className="ca-bar-name">{isAr ? t.ar : t.en}</span>
                          <span className="ca-bar-val" style={{ color: t.color }}>{pct}%</span>
                        </div>
                        <div className="ca-bar-track">
                          <motion.div className="ca-bar-fill" style={{ background: t.color }}
                            initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: 0.1 }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Top 3 types detail */}
            <div className="ca-card">
              <h2>{isAr ? 'أبرز ميولك' : 'Your Top Interests'}</h2>
              {(Object.entries(scores) as [RKey, number][])
                .sort((a,b) => b[1]-a[1]).slice(0,3).map(([k]) => {
                  const t = TYPES.find(x => x.key === k)!
                  return (
                    <div key={k} className="ca-report-block" style={{ borderColor: t.color + '44', background: t.color + '08' }}>
                      <div className="ca-report-title" style={{ color: t.color }}>
                        {k} — {isAr ? t.ar : t.en}
                      </div>
                      <p style={{ fontSize:'0.84rem', color:'#334155', margin:0 }}>
                        {isAr ? t.job_ar : t.job_en}
                      </p>
                    </div>
                  )
                })}
            </div>

            {/* Actions */}
            <div className="ca-actions">
              <button className="ca-btn-outline" onClick={() => { setPhase('info'); setIdx(0); setAnswers(Array(QUESTIONS.length).fill(null)) }}>
                {isAr ? 'إعادة الاختبار' : 'Retake'}
              </button>
              <Link href="/" className="ca-btn-primary">{isAr ? 'العودة للرئيسية' : 'Back to Home'}</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
