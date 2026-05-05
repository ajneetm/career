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
  language: string
  created_at: string
  ai_analysis: string | null
}

const TYPE_LABEL: Record<string, { ar: string; color: string }> = {
  riasec: { ar: 'اكتشف ميولك',       color: '#6366f1' },
  choice: { ar: 'جاهزية الاختيار',   color: '#0288d1' },
  career: { ar: 'المسار المهني',      color: '#16a34a' },
}

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div style={{ background: '#f1f5f9', borderRadius: 99, height: 6, overflow: 'hidden', marginTop: 8 }}>
      <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.6s ease' }} />
    </div>
  )
}

export function MyReportsClient() {
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return }

      supabase
        .from('survey_results')
        .select('id, survey_type, total_score, modal_scores, language, created_at, ai_analysis')
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false })
        .then(({ data: rows }) => {
          setReports(rows ?? [])
          setLoading(false)
        })
    })
  }, [router])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="spinner" />
    </div>
  )

  const latest   = reports[0]
  const rest     = reports.slice(1)

  return (
    <div dir="rtl" style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px 60px' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>تقاريري</h1>
        <Link href="/user" style={{ fontSize: '0.85rem', color: '#64748b', textDecoration: 'none' }}>← الداشبورد</Link>
      </div>

      {reports.length === 0 ? (
        <div className="assessment-card" style={{ textAlign: 'center', padding: 48 }}>
          <p style={{ color: '#64748b', marginBottom: 20 }}>لم تُكمل أي اختبار بعد</p>
          <Link href="/interests" className="btn-primary">ابدأ اكتشف ميولك</Link>
        </div>
      ) : (
        <>
          {/* أحدث تقرير — بطاقة كبيرة */}
          {latest && (
            <div className="assessment-card" style={{ marginBottom: 24, borderRight: `4px solid ${TYPE_LABEL[latest.survey_type]?.color ?? '#1e5fdc'}`, padding: '24px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: TYPE_LABEL[latest.survey_type]?.color ?? '#1e5fdc', textTransform: 'uppercase', letterSpacing: 1 }}>
                    أحدث تقرير
                  </span>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '4px 0' }}>
                    {TYPE_LABEL[latest.survey_type]?.ar ?? latest.survey_type}
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                    {new Date(latest.created_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                {latest.total_score != null && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: TYPE_LABEL[latest.survey_type]?.color ?? '#1e5fdc', lineHeight: 1 }}>
                      {Math.round(latest.total_score)}%
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>النتيجة الكلية</div>
                  </div>
                )}
              </div>

              {latest.total_score != null && (
                <ScoreBar score={latest.total_score} color={TYPE_LABEL[latest.survey_type]?.color ?? '#1e5fdc'} />
              )}

              <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                <Link href={`/my-report/${latest.id}`} className="btn-primary" style={{ fontSize: '0.85rem', padding: '10px 20px' }}>
                  عرض التقرير الكامل
                </Link>
                <Link href="/interests" className="btn-secondary" style={{ fontSize: '0.85rem', padding: '10px 20px' }}>
                  اختبار جديد
                </Link>
              </div>
            </div>
          )}

          {/* بقية التقارير — قائمة مضغوطة */}
          {rest.length > 0 && (
            <div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b', marginBottom: 12 }}>التقارير السابقة</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {rest.map(r => (
                  <Link key={r.id} href={`/my-report/${r.id}`}
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', borderRadius: 12, padding: '14px 18px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: TYPE_LABEL[r.survey_type]?.color ?? '#94a3b8', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>
                          {TYPE_LABEL[r.survey_type]?.ar ?? r.survey_type}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                          {new Date(r.created_at).toLocaleDateString('ar-SA')}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {r.total_score != null && (
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: TYPE_LABEL[r.survey_type]?.color ?? '#64748b' }}>
                          {Math.round(r.total_score)}%
                        </span>
                      )}
                      <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>←</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
