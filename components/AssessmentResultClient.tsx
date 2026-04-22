'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { STAGES, interpretScore } from '@/lib/assessment'

interface AssessmentData {
  id: string
  firstName: string | null
  lastName: string | null
  age: number
  yearsExperience: number
  position: string
  scoreChoice: number
  scoreAdapt: number
  scoreRole: number
  scoreEffective: number
  scoreEsteem: number
  scoreRetire: number
  overallScore: number
  currentStage: string
  aiAnalysis: string | null
  language: string
  createdAt: string
}

interface Props { assessment: AssessmentData }

// ─── Radar (Spider) Chart ─────────────────────────────────────────────────────
function RadarChart({ scores, labels, colors }: { scores: number[]; labels: string[]; colors: string[] }) {
  const size   = 280
  const cx     = size / 2
  const cy     = size / 2
  const radius = 110
  const n      = scores.length

  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2

  const point = (r: number, i: number) => ({
    x: cx + r * Math.cos(angle(i)),
    y: cy + r * Math.sin(angle(i)),
  })

  // Grid rings
  const rings = [20, 40, 60, 80, 100]

  // Data polygon
  const dataPoints = scores.map((s, i) => point((s / 100) * radius, i))
  const dataPath   = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z'

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
      {/* Grid rings */}
      {rings.map(r => {
        const pts = Array.from({ length: n }, (_, i) => point((r / 100) * radius, i))
        const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z'
        return <path key={r} d={path} fill="none" stroke="#e2e8f0" strokeWidth="1" />
      })}

      {/* Axis lines */}
      {Array.from({ length: n }, (_, i) => {
        const outer = point(radius, i)
        return <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="#cbd5e1" strokeWidth="1" />
      })}

      {/* Data polygon */}
      <path d={dataPath} fill="rgba(30,95,220,0.15)" stroke="#1e5fdc" strokeWidth="2" />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={5} fill={colors[i]} stroke="white" strokeWidth="1.5" />
      ))}

      {/* Labels */}
      {Array.from({ length: n }, (_, i) => {
        const labelR = radius + 26
        const p = point(labelR, i)
        const pScore = point((scores[i] / 100) * radius, i)
        return (
          <g key={i}>
            {/* Score badge near data point */}
            <text x={pScore.x} y={pScore.y - 8} textAnchor="middle" fontSize="10" fontWeight="700" fill={colors[i]}>
              {scores[i]}%
            </text>
            {/* Axis label */}
            <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="600" fill="#1e293b">
              {labels[i]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Score Bar ────────────────────────────────────────────────────────────────
function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div style={{ background: '#f1f5f9', borderRadius: 6, height: 8, overflow: 'hidden' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ height: '100%', background: color, borderRadius: 6 }}
      />
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AssessmentResultClient({ assessment }: Props) {
  const isAr = assessment.language === 'ar'
  const dir  = isAr ? 'rtl' : 'ltr'

  const [showAnalysis, setShowAnalysis] = useState(false)

  const scores = [
    assessment.scoreChoice,
    assessment.scoreAdapt,
    assessment.scoreRole,
    assessment.scoreEffective,
    assessment.scoreEsteem,
    assessment.scoreRetire,
  ]

  const radarLabels = STAGES.map(s => isAr ? s.labelAr : s.labelEn)
  const radarColors = STAGES.map(s => s.color)

  const currentStage = STAGES.find(s => s.key === assessment.currentStage)

  const name = [assessment.firstName, assessment.lastName].filter(Boolean).join(' ') || (isAr ? 'المشارك' : 'Participant')

  return (
    <div className="result-page" dir={dir}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="result-header" style={{ borderBottom: `4px solid ${currentStage?.color ?? '#1e5fdc'}` }}>
        <div className="result-header-inner">
          <div>
            <p className="result-label">{isAr ? 'نتائج التقييم المهني' : 'Career Assessment Results'}</p>
            <h1>{name}</h1>
            <p className="result-meta">
              {assessment.age} {isAr ? 'سنة' : 'yrs'} · {assessment.yearsExperience} {isAr ? 'سنوات خبرة' : 'yrs exp'} · {assessment.position}
            </p>
          </div>
          <div className="overall-circle" style={{ borderColor: currentStage?.color }}>
            <span style={{ color: currentStage?.color }}>{assessment.overallScore}%</span>
            <small>{isAr ? 'الإجمالي' : 'Overall'}</small>
          </div>
        </div>
      </div>

      <div className="result-content">

        {/* ── Current Stage Badge ─────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="stage-badge" style={{ borderColor: currentStage?.color, background: `${currentStage?.color}12` }}>
          <div className="stage-letter" style={{ background: currentStage?.color }}>
            {currentStage?.labelEn.charAt(0)}
          </div>
          <div>
            <p className="stage-badge-label">{isAr ? 'مرحلتك الحالية' : 'Your Current Stage'}</p>
            <p className="stage-badge-title" style={{ color: currentStage?.color }}>
              {isAr ? currentStage?.labelAr : currentStage?.labelEn}
              <span className="stage-badge-age"> ({currentStage?.age})</span>
            </p>
          </div>
        </motion.div>

        {/* ── Radar + Scores grid ─────────────────────────────────────────── */}
        <div className="result-grid">

          {/* Radar chart */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className="result-card radar-card">
            <h2>{isAr ? 'الرادار المهني' : 'Career Radar'}</h2>
            <div className="radar-wrap">
              <RadarChart scores={scores} labels={radarLabels} colors={radarColors} />
            </div>
          </motion.div>

          {/* Stage scores */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="result-card scores-card">
            <h2>{isAr ? 'النتائج التفصيلية' : 'Detailed Scores'}</h2>
            <div className="scores-list">
              {STAGES.map((stage, i) => (
                <div key={stage.key} className="score-row">
                  <div className="score-row-header">
                    <div className="score-dot" style={{ background: stage.color }} />
                    <span className="score-name">{isAr ? stage.labelAr : stage.labelEn}</span>
                    <span className="score-age">{stage.age}</span>
                    <span className="score-val" style={{ color: stage.color }}>{scores[i]}%</span>
                  </div>
                  <ScoreBar score={scores[i]} color={stage.color} />
                  {stage.key === assessment.currentStage && (
                    <span className="current-tag" style={{ background: `${stage.color}20`, color: stage.color }}>
                      {isAr ? '← مرحلتك' : '← Your stage'}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Interpretation */}
            <div className="interpretation" style={{ borderColor: currentStage?.color, background: `${currentStage?.color}0d` }}>
              <p style={{ color: currentStage?.color }}>{interpretScore(assessment.overallScore, isAr ? 'ar' : 'en')}</p>
            </div>
          </motion.div>
        </div>

        {/* ── AI Analysis ─────────────────────────────────────────────────── */}
        {assessment.aiAnalysis && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="result-card analysis-card">
            <div className="analysis-header" onClick={() => setShowAnalysis(v => !v)}>
              <h2>{isAr ? 'التحليل المهني الشخصي' : 'Personal Career Analysis'}</h2>
              <span>{showAnalysis ? '▲' : '▼'}</span>
            </div>
            {showAnalysis && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="analysis-body">
                {assessment.aiAnalysis.split('\n').filter(Boolean).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── Actions ─────────────────────────────────────────────────────── */}
        <div className="result-actions">
          <Link href="/assessment" className="btn-secondary">
            {isAr ? '← إعادة التقييم' : '← Retake Assessment'}
          </Link>
          <Link href="/" className="btn-primary">
            {isAr ? 'الصفحة الرئيسية ←' : 'Home →'}
          </Link>
        </div>

      </div>
    </div>
  )
}
