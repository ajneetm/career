'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'

type RKey = 'R' | 'I' | 'A' | 'S' | 'E' | 'C'

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

const KEYS: RKey[] = ['R', 'I', 'A', 'S', 'E', 'C']
const medals = ['🥇', '🥈', '🥉']

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
  const [scores, setScores] = useState<Record<RKey, number> | null>(null)
  const [code, setCode] = useState('')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: auth }) => {
      if (!auth.user) { router.push('/login'); return }

      supabase
        .from('survey_results')
        .select('modal_scores, created_at, survey_type')
        .eq('id', id)
        .eq('user_id', auth.user.id)
        .single()
        .then(({ data, error }) => {
          if (error || !data || data.survey_type !== 'riasec') {
            setNotFound(true); setLoading(false); return
          }
          const ms = data.modal_scores as Record<string, unknown>
          const s = Object.fromEntries(
            KEYS.map(k => [k, typeof ms[k] === 'number' ? (ms[k] as number) : 0])
          ) as Record<RKey, number>
          setScores(s)
          setCode((ms['code'] as string) ?? '')
          setDate(new Date(data.created_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }))
          setLoading(false)
        })
    })
  }, [id, router])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc' }}>
      <div className="spinner" />
    </div>
  )

  if (notFound || !scores) return (
    <div dir="rtl" style={{ maxWidth: 600, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
      <p style={{ color: '#64748b', marginBottom: 16 }}>التقرير غير موجود أو لا تملك صلاحية الوصول إليه.</p>
      <Link href="/my-reports" className="btn-primary">العودة للتقارير</Link>
    </div>
  )

  const ranked = KEYS.map(k => [k, scores[k]] as [RKey, number]).sort((a, b) => b[1] - a[1])
  const top3 = ranked.slice(0, 3)

  async function copyShare() {
    const text = `نتيجة اختبار ميولي المهني RIASEC\nكودي: ${code}\n${top3.map(([k]) => `${RIASEC[k].emoji} ${RIASEC[k].name}`).join('\n')}`
    await navigator.clipboard.writeText(text)
    setCopied(true); setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 80px' }}>

        {/* Back link + date */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <Link href="/my-reports" style={{ fontSize: '0.85rem', color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            ← تقاريري
          </Link>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{date}</span>
        </div>

        {/* ─ Hero ─ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: 'linear-gradient(135deg, #1e5fdc 0%, #6366f1 100%)', borderRadius: 24, padding: '36px 28px', marginBottom: 24, color: 'white', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: 2, opacity: 0.7, marginBottom: 16, textTransform: 'uppercase' }}>
            كود شخصيتك المهنية
          </div>
          <div style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', fontWeight: 900, letterSpacing: 12, marginBottom: 12, fontFamily: 'monospace' }}>
            {code}
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 600, opacity: 0.9, marginBottom: 8 }}>
            {top3.map(([k]) => RIASEC[k].name).join(' · ')}
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.75 }}>
            {top3.map(([k]) => RIASEC[k].emoji).join('  ')}
          </div>
        </motion.div>

        {/* ─ Radar chart ─ */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
          style={{ background: 'white', borderRadius: 20, padding: '28px 20px', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textAlign: 'center' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: 20 }}>مخطط ميولك المهنية</h2>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <RadarChart scores={scores} />
          </div>
        </motion.div>

        {/* ─ Top 3 Career Cards ─ */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>
            🏆 أفضل 3 مسارات مهنية لك
          </h2>
          {top3.map(([k], i) => {
            const d = RIASEC[k]
            return (
              <div key={k} style={{ background: 'white', borderRadius: 20, padding: '24px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: `2px solid ${d.color}25` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <span style={{ fontSize: '1.8rem' }}>{medals[i]}</span>
                  <span style={{ fontSize: '2rem' }}>{d.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: d.color }}>{d.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
                      نسبة التوافق: {Math.round((scores[k] / 20) * 100)}%
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.7, marginBottom: 16 }}>{d.desc}</p>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>المهن المقترحة</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {d.jobs.map(j => (
                      <span key={j.title} style={{ fontSize: '0.82rem', padding: '6px 14px', borderRadius: 10, background: d.bg, color: d.color, fontWeight: 600, border: `1px solid ${d.color}25`, display: 'flex', alignItems: 'center', gap: 5 }}>
                        {j.icon} {j.title}
                      </span>
                    ))}
                  </div>
                </div>

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
        </motion.div>

        {/* ─ Work Environments ─ */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{ background: 'white', borderRadius: 20, padding: '24px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>🏢 بيئات العمل المناسبة لك</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {top3.flatMap(([k]) => RIASEC[k].environments)
              .filter((v, i, a) => a.indexOf(v) === i)
              .map(env => (
                <span key={env} style={{ fontSize: '0.82rem', padding: '7px 14px', borderRadius: 10, background: '#f1f5f9', color: '#374151', fontWeight: 500, border: '1px solid #e2e8f0' }}>
                  {env}
                </span>
              ))}
          </div>
        </motion.div>

        {/* ─ Study Majors ─ */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          style={{ background: 'white', borderRadius: 20, padding: '24px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>🎓 التخصصات الدراسية المناسبة</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {top3.flatMap(([k]) => RIASEC[k].majors)
              .filter((v, i, a) => a.indexOf(v) === i).slice(0, 8)
              .map(m => (
                <span key={m} style={{ fontSize: '0.82rem', padding: '7px 14px', borderRadius: 10, background: '#eff6ff', color: '#1e40af', fontWeight: 600, border: '1px solid #bfdbfe' }}>
                  {m}
                </span>
              ))}
          </div>
        </motion.div>

        {/* ─ Skills to develop ─ */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          style={{ background: 'white', borderRadius: 20, padding: '24px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>⚡ مهارات تحتاج إلى تطوير</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {top3.flatMap(([k]) => RIASEC[k].devSkills)
              .filter((v, i, a) => a.indexOf(v) === i).slice(0, 8)
              .map(s => (
                <span key={s} style={{ fontSize: '0.82rem', padding: '7px 14px', borderRadius: 10, background: '#fef3c7', color: '#92400e', fontWeight: 600, border: '1px solid #fde68a' }}>
                  ↑ {s}
                </span>
              ))}
          </div>
        </motion.div>

        {/* ─ All 6 Dimensions ─ */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          style={{ background: 'white', borderRadius: 20, padding: '24px', marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>📊 تفاصيل جميع الأبعاد</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {ranked.map(([k]) => {
              const d = RIASEC[k]
              const pct = Math.round((scores[k] / 20) * 100)
              return (
                <div key={k}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: '1.1rem' }}>{d.emoji}</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', flex: 1 }}>{d.name}</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: d.color }}>{pct}%</span>
                  </div>
                  <div style={{ background: '#f1f5f9', borderRadius: 99, height: 7, overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, delay: 0.6 }}
                      style={{ height: '100%', background: d.color, borderRadius: 99 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* ─ Actions ─ */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={copyShare}
            style={{ flex: 1, minWidth: 140, padding: '14px', background: copied ? '#16a34a' : 'white', color: copied ? 'white' : '#374151', border: '1.5px solid #e2e8f0', borderRadius: 12, fontFamily: 'inherit', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>
            {copied ? '✓ تم النسخ!' : '📋 مشاركة النتيجة'}
          </button>
          <button onClick={() => window.print()}
            style={{ flex: 1, minWidth: 140, padding: '14px', background: 'white', color: '#374151', border: '1.5px solid #e2e8f0', borderRadius: 12, fontFamily: 'inherit', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>
            🖨️ طباعة / PDF
          </button>
          <Link href="/interests"
            style={{ flex: 1, minWidth: 140, padding: '14px', background: '#f8fafc', color: '#64748b', border: '1.5px solid #e2e8f0', borderRadius: 12, fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>
            ↺ إعادة الاختبار
          </Link>
          <Link href="/my-reports"
            style={{ flex: 1, minWidth: 140, padding: '14px', background: '#1e5fdc', color: 'white', borderRadius: 12, fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            📁 تقاريري
          </Link>
        </motion.div>

      </div>
    </div>
  )
}
