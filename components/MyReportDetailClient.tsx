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

const RIASEC_INFO: Record<string, { ar: string; color: string; icon: string; desc: string; careers: string[] }> = {
  R: {
    ar: 'واقعي', color: '#f59e0b', icon: '🔧',
    desc: 'تميل لأعمال يدوية وعملية تتطلب مهارة جسدية وتقنية. تحب العمل مع الأدوات والآلات والطبيعة.',
    careers: ['مهندس ميكانيكي', 'فني صيانة صناعية', 'مهندس كهربائي', 'مفتش جودة', 'مهندس مدني'],
  },
  I: {
    ar: 'بحثي', color: '#3b82f6', icon: '🔬',
    desc: 'تتميز بالتحليل والتفكير النقدي. تحب البحث والاستكشاف والإجابة على أسئلة معقدة بمنهجية علمية.',
    careers: ['عالم بيانات', 'باحث علمي', 'محلل مالي', 'طبيب / صيدلاني', 'مطور برمجيات'],
  },
  A: {
    ar: 'إبداعي', color: '#8b5cf6', icon: '🎨',
    desc: 'تعبّر عن نفسك بأسلوب مبتكر. تفضل البيئات المرنة التي تتيح لك الابتكار والتعبير الحر.',
    careers: ['مصمم جرافيك', 'كاتب محتوى إبداعي', 'مصور فوتوغرافي', 'منتج وسائط', 'مصمم تجربة مستخدم'],
  },
  S: {
    ar: 'اجتماعي', color: '#10b981', icon: '🤝',
    desc: 'تحب التواصل مع الناس ومساعدتهم. تمتلك مهارات عالية في التواصل والتعاطف والإرشاد.',
    careers: ['معلم / مدرب', 'أخصائي اجتماعي', 'مستشار نفسي', 'مسؤول موارد بشرية', 'منسق مجتمعي'],
  },
  E: {
    ar: 'قيادي', color: '#ef4444', icon: '🚀',
    desc: 'تتمتع بروح قيادية وقدرة على الإقناع. تحب المبادرة وإدارة الفرق وتحقيق الأهداف.',
    careers: ['رائد أعمال', 'مدير مشاريع', 'مدير تسويق', 'مندوب مبيعات متقدم', 'محامي'],
  },
  C: {
    ar: 'تقليدي', color: '#64748b', icon: '📊',
    desc: 'تتميز بالدقة والتنظيم والاهتمام بالتفاصيل. تعمل بشكل ممتاز في البيئات المنظمة ذات الإجراءات الواضحة.',
    careers: ['محاسب قانوني', 'مراجع مالي', 'محلل بيانات', 'مسؤول إداري', 'مدير عمليات'],
  },
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
      </div>

      {/* RIASEC full report */}
      {isRiasec && scores && (() => {
        const ranked = riasecKeys
          .map(k => ({ k, val: typeof scores[k] === 'number' ? (scores[k] as number) : 0 }))
          .sort((a, b) => b.val - a.val)
        const top3 = ranked.slice(0, 3)
        return (
          <>
            {/* Code badge */}
            {code && (
              <div className="assessment-card" style={{ marginBottom: 20, textAlign: 'center', background: '#eff6ff', border: '1.5px solid #bfdbfe' }}>
                <div style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: 600, marginBottom: 6, letterSpacing: 1 }}>
                  كود شخصيتك المهنية
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: 8, color: '#1e5fdc', fontFamily: 'monospace' }}>{code}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 8 }}>
                  {top3.map(({ k }) => RIASEC_INFO[k]?.ar).join(' · ')}
                </div>
              </div>
            )}

            {/* Top 3 careers */}
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>
                🏆 أفضل 3 مسارات مهنية لك
              </h2>
              {top3.map(({ k }, idx) => {
                const info = RIASEC_INFO[k]
                const pct = Math.round(((scores[k] as number) / 20) * 100)
                const medals = ['🥇', '🥈', '🥉']
                return (
                  <div key={k} className="assessment-card" style={{
                    marginBottom: 14, border: `2px solid ${info.color}30`,
                    background: `${info.color}06`, padding: '20px 20px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <span style={{ fontSize: '1.6rem' }}>{medals[idx]}</span>
                      <span style={{ fontSize: '1.5rem' }}>{info.icon}</span>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: info.color }}>
                          الشخصية {info.ar}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 1 }}>نسبة التوافق: {pct}%</div>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.84rem', color: '#475569', marginBottom: 14, lineHeight: 1.7 }}>
                      {info.desc}
                    </p>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e293b', marginBottom: 8, letterSpacing: 0.5 }}>
                        المهن الأنسب لك:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {info.careers.map(c => (
                          <span key={c} style={{
                            fontSize: '0.78rem', padding: '4px 12px', borderRadius: 99,
                            background: `${info.color}18`, color: info.color, fontWeight: 600,
                            border: `1px solid ${info.color}30`,
                          }}>{c}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* All dimensions bar chart */}
            <div className="assessment-card" style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>
                تفاصيل جميع الأبعاد
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {ranked.map(({ k }) => {
                  const raw = scores[k] as number
                  const pct = Math.round((raw / 20) * 100)
                  const info = RIASEC_INFO[k]
                  return (
                    <div key={k}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: '1rem' }}>{info.icon}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', flex: 1 }}>{info.ar}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: info.color }}>{pct}%</span>
                      </div>
                      <div style={{ background: '#f1f5f9', borderRadius: 99, height: 6, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: info.color, borderRadius: 99 }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )
      })()}

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
