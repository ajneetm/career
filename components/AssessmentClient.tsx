'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  QUESTIONS, POSITIONS_AR, POSITIONS_EN, SECTION_LABELS_AR, SECTION_LABELS_EN,
} from '@/lib/assessment'

type Step = 'form' | 'questions' | 'submitting'

const LIKERT_AR = ['لا أوافق بشدة', 'لا أوافق', 'محايد', 'أوافق', 'أوافق بشدة']
const LIKERT_EN = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']

export function AssessmentClient() {
  const router = useRouter()
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const isAr = lang === 'ar'
  const dir  = isAr ? 'rtl' : 'ltr'

  // Form fields
  const [firstName,       setFirstName]       = useState('')
  const [lastName,        setLastName]         = useState('')
  const [email,           setEmail]            = useState('')
  const [phone,           setPhone]            = useState('')
  const [age,             setAge]              = useState('')
  const [yearsExperience, setYearsExperience]  = useState('')
  const [position,        setPosition]         = useState('')

  // Questions
  const [answers,   setAnswers]   = useState<number[]>(Array(21).fill(0))
  const [step,      setStep]      = useState<Step>('form')
  const [error,     setError]     = useState('')

  const likert = isAr ? LIKERT_AR : LIKERT_EN
  const positions = isAr ? POSITIONS_AR : POSITIONS_EN

  // Group questions by section (0-5 | 6-11 | 12-17 | 18-20)
  const sections = [
    { label: isAr ? SECTION_LABELS_AR[0] : SECTION_LABELS_EN[0], questions: QUESTIONS.slice(0,  6)  },
    { label: isAr ? SECTION_LABELS_AR[1] : SECTION_LABELS_EN[1], questions: QUESTIONS.slice(6,  12) },
    { label: isAr ? SECTION_LABELS_AR[2] : SECTION_LABELS_EN[2], questions: QUESTIONS.slice(12, 18) },
    { label: isAr ? SECTION_LABELS_AR[3] : SECTION_LABELS_EN[3], questions: QUESTIONS.slice(18, 21) },
  ]

  const formValid = age.trim() && yearsExperience.trim() && position

  const handleSubmit = async () => {
    const unanswered = answers.findIndex(a => a === 0)
    if (unanswered !== -1) {
      setError(isAr ? `يرجى الإجابة على السؤال ${unanswered + 1}` : `Please answer question ${unanswered + 1}`)
      document.getElementById(`q-${unanswered}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setError('')
    setStep('submitting')

    try {
      const res = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName || null,
          lastName:  lastName  || null,
          email:     email     || null,
          phone:     phone     || null,
          age:             parseInt(age),
          yearsExperience: parseInt(yearsExperience),
          position: isAr ? position : POSITIONS_AR[POSITIONS_EN.indexOf(position)],
          answers,
          language: lang,
        }),
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      router.push(`/assessment/${json.id}`)
    } catch (e: any) {
      setError(e.message)
      setStep('questions')
    }
  }

  return (
    <div className="assessment-page" dir={dir}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="assessment-header">
        <div className="assessment-header-inner">
          <div>
            <h1>{isAr ? 'تقييم المسار المهني' : 'Career Assessment'}</h1>
            <p>{isAr ? 'نموذج أجني للمسار المهني' : 'Ajnee Career Pathway Model'}</p>
          </div>
          <button onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')} className="lang-toggle">
            {lang === 'ar' ? 'EN' : 'AR'}
          </button>
        </div>
      </div>

      <div className="assessment-content">
        <AnimatePresence mode="wait">

          {/* ── Step 1: Form ────────────────────────────────────────────────── */}
          {step === 'form' && (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>

              <div className="assessment-card">
                <h2>{isAr ? 'البيانات الأساسية' : 'Basic Information'}</h2>
                <p className="section-hint">
                  {isAr
                    ? 'الحقول المعلّمة بـ (*) إلزامية. بقية الحقول اختيارية.'
                    : 'Fields marked (*) are required. The rest are optional.'}
                </p>

                <div className="form-grid">
                  {/* Optional fields */}
                  <div className="form-field">
                    <label>{isAr ? 'الاسم' : 'First Name'}</label>
                    <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder={isAr ? 'اختياري' : 'Optional'} />
                  </div>
                  <div className="form-field">
                    <label>{isAr ? 'الكنية' : 'Last Name'}</label>
                    <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder={isAr ? 'اختياري' : 'Optional'} />
                  </div>
                  <div className="form-field">
                    <label>{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={isAr ? 'اختياري' : 'Optional'} />
                  </div>
                  <div className="form-field">
                    <label>{isAr ? 'رقم الهاتف' : 'Phone'}</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder={isAr ? 'اختياري' : 'Optional'} />
                  </div>

                  {/* Required fields */}
                  <div className="form-field">
                    <label>{isAr ? 'العمر *' : 'Age *'}</label>
                    <input type="number" min="15" max="80" value={age} onChange={e => setAge(e.target.value)} placeholder={isAr ? 'مثال: 28' : 'e.g. 28'} required />
                  </div>
                  <div className="form-field">
                    <label>{isAr ? 'سنوات الخبرة *' : 'Years of Experience *'}</label>
                    <input type="number" min="0" max="50" value={yearsExperience} onChange={e => setYearsExperience(e.target.value)} placeholder={isAr ? 'مثال: 5' : 'e.g. 5'} required />
                  </div>
                </div>

                {/* Position */}
                <div className="form-field full-width">
                  <label>{isAr ? 'المنصب الحالي *' : 'Current Position *'}</label>
                  <div className="position-grid">
                    {positions.map((pos, i) => (
                      <button key={i}
                        onClick={() => setPosition(pos)}
                        className={`position-btn ${position === pos ? 'selected' : ''}`}>
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="assessment-actions">
                <button
                  onClick={() => setStep('questions')}
                  disabled={!formValid}
                  className="btn-primary">
                  {isAr ? 'التالي: بدء التقييم ←' : 'Next: Start Assessment →'}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Questions ───────────────────────────────────────────── */}
          {step === 'questions' && (
            <motion.div key="questions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>

              {/* Progress */}
              <div className="progress-bar-wrap">
                <div className="progress-bar-inner" style={{ width: `${(answers.filter(a => a > 0).length / 21) * 100}%` }} />
              </div>
              <p className="progress-label">
                {answers.filter(a => a > 0).length} / 21 {isAr ? 'سؤال' : 'questions'}
              </p>

              {/* Instructions */}
              <div className="assessment-card instructions">
                <p>
                  {isAr
                    ? 'يرجى تقييم مدى موافقتك على كل عبارة من 1 (لا أوافق بشدة) إلى 5 (أوافق بشدة).'
                    : 'Please rate your agreement with each statement from 1 (Strongly Disagree) to 5 (Strongly Agree).'}
                </p>
              </div>

              {/* Sections */}
              {sections.map((section, sIdx) => (
                <div key={sIdx} className="assessment-card section-card">
                  <h3 className="section-title">
                    <span className="section-number">{sIdx + 1}</span>
                    {section.label}
                  </h3>

                  {section.questions.map((q) => (
                    <div key={q.id} id={`q-${q.id}`} className={`question-item ${answers[q.id] === 0 ? 'unanswered' : ''}`}>
                      <p className="question-text">
                        <span className="q-num">{q.id + 1}.</span>
                        {isAr ? q.textAr : q.textEn}
                      </p>
                      <div className="likert-scale">
                        {[1, 2, 3, 4, 5].map(val => (
                          <button key={val}
                            onClick={() => setAnswers(prev => { const n = [...prev]; n[q.id] = val; return n })}
                            className={`likert-btn ${answers[q.id] === val ? 'selected' : ''}`}
                            title={likert[val - 1]}>
                            <span className="likert-val">{val}</span>
                            <span className="likert-label">{likert[val - 1]}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {error && <p className="error-msg">{error}</p>}

              <div className="assessment-actions">
                <button onClick={() => setStep('form')} className="btn-secondary">
                  {isAr ? '← رجوع' : '← Back'}
                </button>
                <button onClick={handleSubmit} className="btn-primary">
                  {isAr ? 'عرض نتائجي ←' : 'View My Results →'}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Submitting ──────────────────────────────────────────────────── */}
          {step === 'submitting' && (
            <motion.div key="submitting" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="submitting-screen">
              <div className="spinner" />
              <p>{isAr ? 'جاري تحليل نتائجك...' : 'Analyzing your results...'}</p>
              <p className="submitting-sub">{isAr ? 'قد يستغرق هذا بضع ثوانٍ' : 'This may take a few seconds'}</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
