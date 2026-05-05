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

type RKey = 'R' | 'I' | 'A' | 'S' | 'E' | 'C'
const KEYS: RKey[] = ['R', 'I', 'A', 'S', 'E', 'C']

type RData = {
  name: string; emoji: string; color: string; bg: string;
  desc: string; strengths: string[]; environments: string[];
  jobs: { title: string; icon: string }[]; majors: string[]; devSkills: string[];
}

const RIASEC: Record<RKey, RData> = {
  R: {
    name: 'الواقعي / العملي', emoji: '🔧', color: '#f59e0b', bg: '#fffbeb',
    desc: 'تفضل العمل بيديك ومع الأجهزة والأدوات. تستمتع بالأعمال الميدانية وحل المشكلات العملية الملموسة.',
    strengths: ['مهارات تقنية عالية', 'دقة في التنفيذ', 'عملي وواقعي', 'صبور وموثوق', 'يحل المشكلات بكفاءة'],
    environments: ['الورش والمصانع', 'المواقع الهندسية', 'البيئات الميدانية', 'المختبرات التقنية'],
    jobs: [
      { title: 'مهندس ميكانيكي', icon: '⚙️' }, { title: 'فني صيانة متقدم', icon: '🔩' },
      { title: 'مهندس مدني', icon: '🏗️' }, { title: 'مفتش جودة', icon: '✅' },
      { title: 'طيار تجاري', icon: '✈️' }, { title: 'تقني طبي', icon: '🩺' },
    ],
    majors: ['الهندسة الميكانيكية', 'الهندسة الكهربائية', 'تقنية المعلومات', 'الطيران', 'الهندسة المدنية'],
    devSkills: ['التواصل المكتوب', 'التفكير المجرد', 'إدارة الوقت', 'التخطيط الاستراتيجي'],
  },
  I: {
    name: 'البحثي / التحليلي', emoji: '🔬', color: '#3b82f6', bg: '#eff6ff',
    desc: 'تتميز بالتفكير التحليلي والفضول المعرفي. تحب البحث والاستكشاف وحل المشكلات المعقدة بمنهجية علمية.',
    strengths: ['تفكير نقدي حاد', 'فضول معرفي لا ينتهي', 'دقة وتمحيص في البيانات', 'قدرة بحثية عالية'],
    environments: ['مراكز الأبحاث', 'الجامعات والمعاهد', 'المختبرات العلمية', 'شركات تحليل البيانات'],
    jobs: [
      { title: 'عالم بيانات', icon: '📊' }, { title: 'باحث علمي', icon: '🧪' },
      { title: 'طبيب أخصائي', icon: '⚕️' }, { title: 'محلل أمن سيبراني', icon: '🛡️' },
      { title: 'مطور برمجيات', icon: '💻' }, { title: 'اقتصادي', icon: '📈' },
    ],
    majors: ['علوم الحاسوب', 'الطب البشري', 'علم البيانات', 'الفيزياء والكيمياء', 'الاقتصاد التطبيقي'],
    devSkills: ['التواصل الشفهي', 'القيادة والإدارة', 'العمل الجماعي', 'المبادرة الذاتية'],
  },
  A: {
    name: 'الفني / الإبداعي', emoji: '🎨', color: '#8b5cf6', bg: '#f5f3ff',
    desc: 'تمتلك حساً إبداعياً وتعبيرياً قوياً. تزدهر في البيئات المرنة التي تتيح لك الابتكار والتعبير الحر.',
    strengths: ['إبداع وخيال واسع', 'حساسية جمالية رفيعة', 'تعبير فريد وأصيل', 'ابتكار حلول غير تقليدية'],
    environments: ['الاستوديوهات الإبداعية', 'وكالات الإعلان', 'شركات التقنية الإبداعية', 'دور النشر'],
    jobs: [
      { title: 'مصمم جرافيك', icon: '✏️' }, { title: 'مصمم UX/UI', icon: '📱' },
      { title: 'كاتب محتوى', icon: '✍️' }, { title: 'مخرج أفلام', icon: '🎬' },
      { title: 'مصور فوتوغرافي', icon: '📷' }, { title: 'مهندس معماري', icon: '🏛️' },
    ],
    majors: ['الفنون البصرية', 'الإعلام والاتصال', 'العمارة والتصميم', 'التصميم الجرافيكي'],
    devSkills: ['الانضباط الذاتي', 'الالتزام بالمواعيد', 'العمل ضمن قيود', 'مهارات العرض والتقديم'],
  },
  S: {
    name: 'الاجتماعي', emoji: '🤝', color: '#10b981', bg: '#f0fdf4',
    desc: 'تستمد طاقتك من التفاعل مع الناس. تمتلك مهارات تواصل استثنائية وقدرة فطرية على التعاطف والمساعدة.',
    strengths: ['تواصل إنساني ممتاز', 'تعاطف وفهم عميق', 'قدرة على التحفيز', 'مهارة الإصغاء الفعّال'],
    environments: ['المدارس والجامعات', 'المستشفيات والعيادات', 'منظمات المجتمع', 'المراكز التدريبية'],
    jobs: [
      { title: 'معلم ومدرب', icon: '📚' }, { title: 'مرشد نفسي', icon: '🧠' },
      { title: 'أخصائي اجتماعي', icon: '🏥' }, { title: 'مدير موارد بشرية', icon: '👥' },
      { title: 'مدرب تطوير ذاتي', icon: '🌱' }, { title: 'طبيب عام', icon: '⚕️' },
    ],
    majors: ['التربية وعلم النفس', 'الخدمة الاجتماعية', 'الطب وعلوم الصحة', 'الإرشاد المهني'],
    devSkills: ['القيادة الحازمة', 'الانضباط الذاتي', 'التفكير التحليلي', 'إدارة الوقت تحت الضغط'],
  },
  E: {
    name: 'الريادي / القيادي', emoji: '🚀', color: '#ef4444', bg: '#fef2f2',
    desc: 'تمتلك روحاً قيادية وطاقة ريادية. تحب التأثير والإقناع وقيادة الفرق نحو الأهداف الكبيرة.',
    strengths: ['قيادة طبيعية ملهمة', 'إقناع وتأثير قوي', 'طموح وعزيمة لا تلين', 'جرأة في اتخاذ القرارات'],
    environments: ['الشركات الناشئة', 'قطاع المبيعات والتجارة', 'المؤسسات التجارية', 'الميدان السياسي'],
    jobs: [
      { title: 'رائد أعمال', icon: '💡' }, { title: 'مدير تنفيذي', icon: '🏢' },
      { title: 'مدير مبيعات', icon: '📊' }, { title: 'مستشار أعمال', icon: '💼' },
      { title: 'محامي', icon: '⚖️' }, { title: 'مسؤول سياسي', icon: '🏛️' },
    ],
    majors: ['إدارة الأعمال', 'الاقتصاد والمالية', 'الحقوق والسياسة', 'التسويق', 'ريادة الأعمال'],
    devSkills: ['إدارة التفاصيل الدقيقة', 'الاستماع الفعّال', 'التواضع القيادي', 'التحليل المنهجي'],
  },
  C: {
    name: 'التقليدي / التنظيمي', emoji: '📊', color: '#64748b', bg: '#f8fafc',
    desc: 'تتميز بالدقة والمنهجية والانضباط. تزدهر في البيئات المنظمة التي تتطلب الدقة واتباع الأنظمة الواضحة.',
    strengths: ['دقة ومنهجية عالية', 'تنظيم احترافي', 'موثوقية وأمانة', 'انضباط ذاتي قوي'],
    environments: ['المؤسسات المالية', 'الجهات الحكومية', 'شركات المحاسبة', 'مراكز البيانات'],
    jobs: [
      { title: 'محاسب قانوني', icon: '📑' }, { title: 'مراجع مالي', icon: '🔍' },
      { title: 'محلل بيانات', icon: '📈' }, { title: 'مسؤول امتثال', icon: '✅' },
      { title: 'إداري متقدم', icon: '📋' }, { title: 'مدير عمليات', icon: '⚙️' },
    ],
    majors: ['المحاسبة والمراجعة', 'المالية والمصرفية', 'الإدارة العامة', 'نظم المعلومات', 'الإحصاء'],
    devSkills: ['المرونة والتكيف', 'الإبداع والابتكار', 'التفكير خارج الصندوق', 'المبادرة والريادة'],
  },
}

function RadarChart({ scores }: { scores: Record<RKey, number> }) {
  const size = 300, cx = size / 2, cy = size / 2, r = 105, n = 6
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2
  const pt = (rad: number, i: number) => ({ x: cx + rad * Math.cos(angle(i)), y: cy + rad * Math.sin(angle(i)) })
  const dataPoints = KEYS.map((k, i) => pt((scores[k] / 20) * r, i))
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z'
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
      {[25, 50, 75, 100].map(pct => {
        const pts = KEYS.map((_, i) => pt((pct / 100) * r, i))
        const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z'
        return <path key={pct} d={path} fill="none" stroke={pct === 100 ? '#cbd5e1' : '#e2e8f0'} strokeWidth="1.5" />
      })}
      {KEYS.map((_, i) => {
        const outer = pt(r, i)
        return <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="#e2e8f0" strokeWidth="1.5" />
      })}
      <path d={dataPath} fill="rgba(99,102,241,0.1)" stroke="#6366f1" strokeWidth="2.5" />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={5} fill={RIASEC[KEYS[i]].color} stroke="white" strokeWidth="2" />
      ))}
      {KEYS.map((k, i) => {
        const lp = pt(r + 32, i)
        const sp = pt((scores[k] / 20) * r, i)
        const pct = Math.round((scores[k] / 20) * 100)
        return (
          <g key={k}>
            <text x={lp.x} y={lp.y - 6} textAnchor="middle" fontSize="10" fontWeight="700" fill="#374151">
              {RIASEC[k].emoji}
            </text>
            <text x={lp.x} y={lp.y + 8} textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#374151">
              {RIASEC[k].name.split('/')[0].trim()}
            </text>
            {pct > 0 && (
              <text x={sp.x} y={sp.y - 10} textAnchor="middle" fontSize="8.5" fontWeight="700" fill={RIASEC[k].color}>
                {pct}%
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export function MyReportDetailClient({ id }: { id: string }) {
  const router = useRouter()
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied] = useState(false)

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

  const isAr = report.language === 'ar'
  const type = TYPE_LABEL[report.survey_type]
  const scores = report.modal_scores as Record<string, unknown> | null
  const isRiasec = report.survey_type === 'riasec'
  const code = isRiasec && scores ? (scores['code'] as string) : null

  const ranked = isRiasec && scores
    ? KEYS.map(k => ({ k, val: typeof scores[k] === 'number' ? (scores[k] as number) : 0 }))
        .sort((a, b) => b.val - a.val)
    : []
  const top3 = ranked.slice(0, 3)
  const riasecScores = isRiasec && scores
    ? Object.fromEntries(KEYS.map(k => [k, typeof scores[k] === 'number' ? (scores[k] as number) : 0])) as Record<RKey, number>
    : null
  const medals = ['🥇', '🥈', '🥉']

  async function copyShare() {
    if (!code) return
    const text = `نتيجة اختبار ميولي المهني RIASEC\nكودي: ${code}\n${top3.map(({ k }) => `${RIASEC[k].emoji} ${RIASEC[k].name}`).join('\n')}`
    await navigator.clipboard.writeText(text)
    setCopied(true); setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px 60px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Link href="/my-reports" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.85rem' }}>
          {isAr ? '← تقاريري' : '← My Reports'}
        </Link>
      </div>

      {/* Title card */}
      <div className="assessment-card" style={{ borderRight: `4px solid ${type?.color ?? '#1e5fdc'}`, padding: '20px', marginBottom: 20 }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: type?.color, letterSpacing: 1, textTransform: 'uppercase' }}>
          {isAr ? type?.ar : type?.en}
        </div>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '6px 0 4px' }}>
          {report.name ?? report.email}
        </h1>
        <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
          {new Date(report.created_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* ── RIASEC full report ── */}
      {isRiasec && scores && riasecScores && (() => {
        return (
          <>
            {/* Hero code badge */}
            <div style={{ background: 'linear-gradient(135deg, #1e5fdc 0%, #6366f1 100%)', borderRadius: 24, padding: '32px 28px', marginBottom: 20, color: 'white', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: 2, opacity: 0.7, marginBottom: 12, textTransform: 'uppercase' }}>
                كود شخصيتك المهنية
              </div>
              <div style={{ fontSize: 'clamp(2.2rem, 7vw, 3.5rem)', fontWeight: 900, letterSpacing: 10, marginBottom: 12, fontFamily: 'monospace' }}>
                {code}
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, opacity: 0.9, marginBottom: 6 }}>
                {top3.map(({ k }) => RIASEC[k].name).join(' · ')}
              </div>
              <div style={{ fontSize: '0.85rem', opacity: 0.75 }}>
                {top3.map(({ k }) => RIASEC[k].emoji).join('  ')}
              </div>
            </div>

            {/* Radar chart */}
            <div className="assessment-card" style={{ marginBottom: 20, textAlign: 'center' }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: 20 }}>مخطط ميولك المهنية</h2>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <RadarChart scores={riasecScores} />
              </div>
            </div>

            {/* Top 3 career cards */}
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>
                🏆 أفضل 3 مسارات مهنية لك
              </h2>
              {top3.map(({ k }, idx) => {
                const d = RIASEC[k]
                const pct = Math.round(((scores[k] as number) / 20) * 100)
                return (
                  <div key={k} style={{
                    background: 'white', borderRadius: 20, padding: '24px', marginBottom: 16,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: `2px solid ${d.color}25`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <span style={{ fontSize: '1.8rem' }}>{medals[idx]}</span>
                      <span style={{ fontSize: '2rem' }}>{d.emoji}</span>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: d.color }}>{d.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>نسبة التوافق: {pct}%</div>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.7, marginBottom: 16 }}>{d.desc}</p>

                    {/* Jobs */}
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>المهن المقترحة</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {d.jobs.map(j => (
                          <span key={j.title} style={{ fontSize: '0.82rem', padding: '6px 14px', borderRadius: 10, background: d.bg, color: d.color, fontWeight: 600, border: `1px solid ${d.color}25`, display: 'flex', alignItems: 'center', gap: 5 }}>
                            {j.icon} {j.title}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Strengths */}
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>نقاط قوتك</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {d.strengths.map(s => (
                          <span key={s} style={{ fontSize: '0.78rem', padding: '4px 10px', borderRadius: 99, background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', fontWeight: 500 }}>
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Work environments */}
            <div className="assessment-card" style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>🏢 بيئات العمل المناسبة لك</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {top3.flatMap(({ k }) => RIASEC[k].environments)
                  .filter((v, i, a) => a.indexOf(v) === i)
                  .map(env => (
                    <span key={env} style={{ fontSize: '0.82rem', padding: '7px 14px', borderRadius: 10, background: '#f1f5f9', color: '#374151', fontWeight: 500, border: '1px solid #e2e8f0' }}>
                      {env}
                    </span>
                  ))}
              </div>
            </div>

            {/* Study majors */}
            <div className="assessment-card" style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>🎓 التخصصات الدراسية المناسبة</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {top3.flatMap(({ k }) => RIASEC[k].majors)
                  .filter((v, i, a) => a.indexOf(v) === i).slice(0, 8)
                  .map(m => (
                    <span key={m} style={{ fontSize: '0.82rem', padding: '7px 14px', borderRadius: 10, background: '#eff6ff', color: '#1e40af', fontWeight: 600, border: '1px solid #bfdbfe' }}>
                      {m}
                    </span>
                  ))}
              </div>
            </div>

            {/* Dev skills */}
            <div className="assessment-card" style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>⚡ مهارات تحتاج إلى تطوير</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {top3.flatMap(({ k }) => RIASEC[k].devSkills)
                  .filter((v, i, a) => a.indexOf(v) === i).slice(0, 8)
                  .map(s => (
                    <span key={s} style={{ fontSize: '0.82rem', padding: '7px 14px', borderRadius: 10, background: '#fef3c7', color: '#92400e', fontWeight: 600, border: '1px solid #fde68a' }}>
                      ↑ {s}
                    </span>
                  ))}
              </div>
            </div>

            {/* All 6 dimensions */}
            <div className="assessment-card" style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>📊 تفاصيل جميع الأبعاد</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {ranked.map(({ k }) => {
                  const d = RIASEC[k]
                  const pct = Math.round(((scores[k] as number) / 20) * 100)
                  return (
                    <div key={k}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: '1.1rem' }}>{d.emoji}</span>
                        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', flex: 1 }}>{d.name}</span>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: d.color }}>{pct}%</span>
                      </div>
                      <div style={{ background: '#f1f5f9', borderRadius: 99, height: 7, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: d.color, borderRadius: 99, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )
      })()}

      {/* AI Analysis */}
      {report.ai_analysis ? (
        <div className="assessment-card" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>
            {isAr ? 'التحليل المهني' : 'Career Analysis'}
          </h2>
          <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
            {report.ai_analysis}
          </div>
        </div>
      ) : null}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {isRiasec && code && (
          <button onClick={copyShare}
            style={{ flex: 1, minWidth: 140, padding: '14px', background: copied ? '#16a34a' : 'white', color: copied ? 'white' : '#374151', border: '1.5px solid #e2e8f0', borderRadius: 12, fontFamily: 'inherit', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>
            {copied ? '✓ تم النسخ!' : '📋 مشاركة النتيجة'}
          </button>
        )}
        <button onClick={() => window.print()}
          style={{ flex: 1, minWidth: 140, padding: '14px', background: 'white', color: '#374151', border: '1.5px solid #e2e8f0', borderRadius: 12, fontFamily: 'inherit', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>
          🖨️ طباعة / PDF
        </button>
        <Link href="/interests" className="btn-primary" style={{ flex: 1, minWidth: 140, padding: '14px', fontSize: '0.88rem', textAlign: 'center', borderRadius: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isAr ? 'اختبار جديد' : 'New Assessment'}
        </Link>
        <Link href="/my-reports" className="btn-secondary" style={{ flex: 1, minWidth: 140, padding: '14px', fontSize: '0.88rem', textAlign: 'center', borderRadius: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isAr ? 'كل تقاريري' : 'All Reports'}
        </Link>
      </div>

    </div>
  )
}
