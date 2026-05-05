'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

type Report = {
  id: string
  survey_type: string
  total_score: number | null
  modal_scores: Record<string, unknown> | null
  ai_analysis: string | null
  language: string
  created_at: string
  name: string | null
  email: string | null
}

const TYPE_LABEL: Record<string, { ar: string; en: string; color: string }> = {
  riasec: { ar: 'اكتشف ميولك',     en: 'Career Interests', color: '#6366f1' },
  choice: { ar: 'جاهزية الاختيار', en: 'Choice Readiness', color: '#0288d1' },
  career: { ar: 'المسار المهني',   en: 'Career Path',      color: '#16a34a' },
}

const RIASEC_INFO: Record<string, { ar: string; color: string }> = {
  R: { ar: 'واقعي',   color: '#f59e0b' },
  I: { ar: 'بحثي',    color: '#3b82f6' },
  A: { ar: 'إبداعي',  color: '#8b5cf6' },
  S: { ar: 'اجتماعي', color: '#10b981' },
  E: { ar: 'قيادي',   color: '#ef4444' },
  C: { ar: 'تقليدي',  color: '#64748b' },
}

export function MyReportDetailClient({ id }: { id: string }) {
  const router = useRouter()
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: auth }) => {
      if (!auth.user) { router.push('/login'); return }

      supabase
        .from('survey_results')
        .select('*')
        .eq('id', id)
        .eq('user_id', auth.user.id)
        .single()
        .then(({ data, error }) => {
          if (error || !data) { setNotFound(true); setLoading(false); return }
          setReport(data)
          setLoading(false)
        })
    })
  }, [id, router])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="spinner" />
    </div>
  )

  if (notFound || !report) return (
    <div dir="rtl" style={{ maxWidth: 600, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
      <p style={{ color: '#64748b', marginBottom: 16 }}>التقرير غير موجود أو لا تملك صلاحية الوصول إليه.</p>
      <Link href="/my-reports" className="btn-primary">العودة للتقارير</Link>
    </div>
  )

  const isAr    = report.language === 'ar'
  const type    = TYPE_LABEL[report.survey_type]
  const scores  = report.modal_scores as Record<string, unknown> | null
  const riasecKeys = ['R','I','A','S','E','C']
  const isRiasec   = report.survey_type === 'riasec'
  const code       = isRiasec && scores ? (scores['code'] as string) : null
  const jobs       = isRiasec && scores ? (scores['jobs'] as string) : null

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px 60px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Link href="/my-reports" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.85rem' }}>
          {isAr ? '← تقاريري' : '← My Reports'}
        </Link>
      </div>

      {/* Title card */}
      <div className="assessment-card" style={{ borderRight: `4px solid ${type?.color ?? '#1e5fdc'}`, padding: '24px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: type?.color, letterSpacing: 1, textTransform: 'uppercase' }}>
              {isAr ? type?.ar : type?.en}
            </div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: '6px 0 4px' }}>
              {report.name ?? report.email}
            </h1>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
              {new Date(report.created_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          {report.total_score != null && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: type?.color, lineHeight: 1 }}>
                {Math.round(report.total_score)}%
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>{isAr ? 'النتيجة الكلية' : 'Overall Score'}</div>
            </div>
          )}
        </div>

        {report.total_score != null && (
          <div style={{ background: '#f1f5f9', borderRadius: 99, height: 8, overflow: 'hidden', marginTop: 16 }}>
            <div style={{ width: `${report.total_score}%`, height: '100%', background: type?.color, borderRadius: 99 }} />
          </div>
        )}
      </div>

      {/* RIASEC code + scores */}
      {isRiasec && scores && (
        <>
          {code && (
            <div className="assessment-card" style={{ marginBottom: 16, textAlign: 'center', background: '#eff6ff', borderColor: '#bfdbfe' }}>
              <div style={{ fontSize: '0.78rem', color: '#1e40af', fontWeight: 600, marginBottom: 6 }}>
                {isAr ? 'كود الميول المهنية' : 'Interest Code'}
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: 6, color: '#1e5fdc' }}>{code}</div>
              {jobs && <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: 8 }}>{jobs}</div>}
            </div>
          )}

          <div className="assessment-card" style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>
              {isAr ? 'تفاصيل الأبعاد' : 'Dimension Scores'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {riasecKeys.map(k => {
                const raw = scores[k]
                if (typeof raw !== 'number') return null
                const pct = Math.round((raw / 20) * 100)
                const info = RIASEC_INFO[k]
                return (
                  <div key={k}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: info.color }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', flex: 1 }}>{info.ar}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: info.color }}>{pct}%</span>
                    </div>
                    <div style={{ background: '#f1f5f9', borderRadius: 99, height: 5, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: info.color, borderRadius: 99 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* AI Analysis placeholder */}
      {report.ai_analysis ? (
        <div className="assessment-card" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>
            {isAr ? 'التحليل المهني' : 'Career Analysis'}
          </h2>
          <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
            {report.ai_analysis}
          </div>
        </div>
      ) : (
        <div className="assessment-card" style={{ marginBottom: 16, background: '#f8fafc', textAlign: 'center', padding: '24px' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            {isAr ? 'التحليل المهني سيكون متاحاً قريباً' : 'AI analysis coming soon'}
          </p>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link href="/interests" className="btn-primary" style={{ fontSize: '0.85rem' }}>
          {isAr ? 'اختبار جديد' : 'New Assessment'}
        </Link>
        <Link href="/my-reports" className="btn-secondary" style={{ fontSize: '0.85rem' }}>
          {isAr ? 'كل تقاريري' : 'All Reports'}
        </Link>
      </div>

    </div>
  )
}
