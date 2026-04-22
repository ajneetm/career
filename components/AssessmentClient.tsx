'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { POSITIONS_AR, POSITIONS_EN } from '@/lib/assessment'

type Step = 'form' | 'loading-questions' | 'questions' | 'submitting'

const LIKERT_AR = ['لا أوافق بشدة', 'لا أوافق', 'محايد', 'أوافق', 'أوافق بشدة']
const LIKERT_EN = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']

interface AIQuestion { id: number; text: string; stage: string }

export function AssessmentClient() {
  const router = useRouter()
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const isAr = lang === 'ar'

  // Form fields
  const [firstName,       setFirstName]      = useState('')
  const [lastName,        setLastName]        = useState('')
  const [email,           setEmail]           = useState('')
  const [phone,           setPhone]           = useState('')
  const [age,             setAge]             = useState('')
  const [yearsExperience, setYearsExp]        = useState('')
  const [position,        setPosition]        = useState('')

  // Questions & answers
  const [aiQuestions, setAiQuestions] = useState<AIQuestion[]>([])
  const [answers,     setAnswers]     = useState<number[]>([])
  const [step,        setStep]        = useState<Step>('form')
  const [error,       setError]       = useState('')

  const likert    = isAr ? LIKERT_AR : LIKERT_EN
  const positions = isAr ? POSITIONS_AR : POSITIONS_EN
  const formValid = age.trim() && yearsExperience.trim() && position

  // ── Load AI questions ──────────────────────────────────────────────────────
  const handleLoadQuestions = async () => {
    setError('')
    setStep('loading-questions')
    try {
      const posAr = isAr ? position : POSITIONS_AR[POSITIONS_EN.indexOf(position)]
      const res = await fetch('/api/assessment/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ age: parseInt(age), yearsExperience: parseInt(yearsExperience), position: posAr, language: lang }),
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setAiQuestions(json.questions)
      setAnswers(Array(json.questions.length).fill(0))
      setStep('questions')
    } catch (e: any) {
      setError(e.message)
      setStep('form')
    }
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
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
      const posAr = isAr ? position : POSITIONS_AR[POSITIONS_EN.indexOf(position)]
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
          position: posAr,
          questions: aiQuestions,
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
    <div className="assessment-page" dir={isAr ? 'rtl' : 'ltr'}>

      {/* Header */}
      <div className="assessment-header">
        <div className="assessment-header-inner">
          <div>
            <h1>{isAr ? 'تقييم المسار المهني' : 'Career Assessment'}</h1>
            <p>{isAr ? 'أسئلة مخصصة لحالتك من الذكاء الاصطناعي' : 'AI-personalized questions for your profile'}</p>
          </div>
          <button onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')} className="lang-toggle">
            {lang === 'ar' ? 'EN' : 'AR'}
          </button>
        </div>
      </div>

      <div className="assessment-content">
        <AnimatePresence mode="wait">

          {/* ── Form ──────────────────────────────────────────────────────── */}
          {step === 'form' && (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="assessment-card">
                <h2>{isAr ? 'البيانات الأساسية' : 'Basic Information'}</h2>
                <p className="section-hint">{isAr ? 'الحقول المعلّمة بـ (*) إلزامية' : 'Fields marked (*) are required'}</p>

                <div className="form-grid">
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
                  <div className="form-field">
                    <label>{isAr ? 'العمر *' : 'Age *'}</label>
                    <input type="number" min="15" max="80" value={age} onChange={e => setAge(e.target.value)} placeholder={isAr ? 'مثال: 28' : 'e.g. 28'} />
                  </div>
                  <div className="form-field">
                    <label>{isAr ? 'سنوات الخبرة *' : 'Years of Experience *'}</label>
                    <input type="number" min="0" max="50" value={yearsExperience} onChange={e => setYearsExp(e.target.value)} placeholder={isAr ? 'مثال: 5' : 'e.g. 5'} />
                  </div>
                </div>

                <div className="form-field full-width">
                  <label>{isAr ? 'المنصب الحالي *' : 'Current Position *'}</label>
                  <div className="position-grid">
                    {positions.map((pos, i) => (
                      <button key={i} onClick={() => setPosition(pos)}
                        className={`position-btn ${position === pos ? 'selected' : ''}`}>
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {error && <p className="error-msg">{error}</p>}

              <div className="assessment-actions">
                <button onClick={handleLoadQuestions} disabled={!formValid} className="btn-primary">
                  {isAr ? 'توليد الأسئلة بالذكاء الاصطناعي ←' : 'Generate AI Questions →'}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Loading questions ──────────────────────────────────────────── */}
          {step === 'loading-questions' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="submitting-screen">
              <div className="spinner" />
              <p>{isAr ? 'يولّد الذكاء الاصطناعي أسئلة مخصصة لحالتك...' : 'AI is generating personalized questions for you...'}</p>
              <p className="submitting-sub">{isAr ? 'بضع ثوانٍ فقط' : 'Just a few seconds'}</p>
            </motion.div>
          )}

          {/* ── Questions ─────────────────────────────────────────────────── */}
          {step === 'questions' && (
            <motion.div key="questions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>

              {/* Progress */}
              <div className="progress-bar-wrap">
                <div className="progress-bar-inner" style={{ width: `${(answers.filter(a => a > 0).length / aiQuestions.length) * 100}%` }} />
              </div>
              <p className="progress-label">
                {answers.filter(a => a > 0).length} / {aiQuestions.length} {isAr ? 'سؤال' : 'questions'}
              </p>

              <div className="assessment-card instructions">
                <p>
                  {isAr
                    ? '✨ هذه الأسئلة وُلّدت خصيصاً لملفك الشخصي. قيّم مدى موافقتك على كل عبارة من 1 إلى 5.'
                    : '✨ These questions were generated specifically for your profile. Rate your agreement from 1 to 5.'}
                </p>
              </div>

              <div className="assessment-card section-card">
                <h3 className="section-title">
                  <span className="section-number">?</span>
                  {isAr ? 'أسئلة التقييم المخصصة' : 'Personalized Assessment Questions'}
                </h3>

                {aiQuestions.map((q, idx) => (
                  <div key={q.id} id={`q-${idx}`} className="question-item">
                    <p className="question-text">
                      <span className="q-num">{idx + 1}.</span>
                      {q.text}
                    </p>
                    <div className="likert-scale">
                      {[1, 2, 3, 4, 5].map(val => (
                        <button key={val}
                          onClick={() => setAnswers(prev => { const n = [...prev]; n[idx] = val; return n })}
                          className={`likert-btn ${answers[idx] === val ? 'selected' : ''}`}
                          title={likert[val - 1]}>
                          <span className="likert-val">{val}</span>
                          <span className="likert-label">{likert[val - 1]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {error && <p className="error-msg">{error}</p>}

              <div className="assessment-actions">
                <button onClick={() => setStep('form')} className="btn-secondary">
                  {isAr ? '← رجوع' : '← Back'}
                </button>
                <button onClick={handleSubmit} className="btn-primary">
                  {isAr ? 'تحليل نتائجي ←' : 'Analyze My Results →'}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Submitting ─────────────────────────────────────────────────── */}
          {step === 'submitting' && (
            <motion.div key="submitting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="submitting-screen">
              <div className="spinner" />
              <p>{isAr ? 'الذكاء الاصطناعي يحلل إجاباتك ويكتب تقريرك...' : 'AI is analyzing your answers and writing your report...'}</p>
              <p className="submitting-sub">{isAr ? 'قد يستغرق هذا 10-15 ثانية' : 'This may take 10-15 seconds'}</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
