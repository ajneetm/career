'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

// ─── Radar Chart ──────────────────────────────────────────────────────────────
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
        const p = point(radius + 24, i)
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

// ─── Stage configs ────────────────────────────────────────────────────────────
const AXIS_COLORS = ['#1e5fdc', '#0288d1', '#7c3aed', '#388e3c', '#f57c00', '#c62828']

type AxisDef = { id: string; title: string; color: string; questions: string[]; needs: string[] }
type StageConfig = { id: string; title: string; goal: string; brand: string; axes: AxisDef[] }

const STAGES: Record<string, StageConfig> = {
  adapt: {
    id: 'adapt', title: 'مرحلة التأقلم', brand: '#fb8c00',
    goal: 'قياس قدرتك على الاندماج السريع وإثبات نفسك في بيئة العمل',
    axes: [
      { id: 'clarity',   title: 'وضوح الدور',             color: AXIS_COLORS[0],
        questions: ['أفهم دوري الوظيفي بشكل واضح.', 'أعرف ما المتوقع مني خلال الفترة الحالية.', 'أستوعب ثقافة العمل في جهتي.', 'لدي تصور واضح لما يعني "النجاح" في وظيفتي.'],
        needs: ['قراءة التوصيف الوظيفي بعناية وطلب توضيحه', 'استيعاب القيم والأولويات في بيئة العمل', 'تحديد مؤشرات نجاح شخصية قابلة للقياس', 'طلب لقاء توجيهي مع المدير المباشر'] },
      { id: 'awareness', title: 'الوعي التنظيمي',          color: AXIS_COLORS[1],
        questions: ['أفهم أنظمة وإجراءات العمل.', 'أعرف كيف تُقيّم جهتي الأداء.', 'أميز بين العمل الصحيح والعمل المقبول.', 'أفهم طبيعة العلاقات المهنية داخل العمل.'],
        needs: ['التعرف على دليل الموظف والسياسات الداخلية', 'فهم نظام تقييم الأداء المتبع', 'ملاحظة كيفية تصرف الزملاء الناجحين', 'بناء خريطة للعلاقات المهنية داخل المؤسسة'] },
      { id: 'decision',  title: 'الثقة في القرار',         color: AXIS_COLORS[2],
        questions: ['أتصرف بثقة في المواقف اليومية.', 'أتعامل مع الأخطاء بشكل منطقي.', 'أطلب المساعدة عند الحاجة.', 'لا أتردد في اتخاذ قرارات بسيطة.'],
        needs: ['تطوير آلية لاتخاذ قرارات سريعة', 'التعامل مع الأخطاء كفرص تعلم لا كفشل', 'التدرب على طلب المساعدة بشكل احترافي', 'بناء قائمة بالقرارات التي تملك صلاحية اتخاذها'] },
      { id: 'readiness', title: 'الجاهزية التعلمية',       color: AXIS_COLORS[3],
        questions: ['أتعلم بسرعة من الملاحظات.', 'ألتزم بالوقت والانضباط.', 'أطور مهاراتي الأساسية.', 'أتحمل ضغط البداية.'],
        needs: ['وضع خطة أسبوعية للتعلم والتطوير', 'الاستفادة من ملاحظات المدير فور استلامها', 'تحديد مهارة جوهرية وتطويرها فورًا', 'تطوير استراتيجية شخصية لإدارة الضغط'] },
      { id: 'support',   title: 'الدعم والعلاقات',         color: AXIS_COLORS[4],
        questions: ['لدي شخص أرجع له للتوجيه.', 'أبني علاقات إيجابية مع الزملاء.', 'أتقبل النقد.', 'أتعامل باحترافية مع الجميع.'],
        needs: ['إيجاد مرشد أو زميل خبير للتوجيه', 'بناء علاقات بداية بالمقربين في الفريق', 'تطوير قدرة تقبل النقد البنّاء بإيجابية', 'الانضمام لمبادرات أو نشاطات الفريق'] },
      { id: 'execution', title: 'الإنجاز اليومي',          color: AXIS_COLORS[5],
        questions: ['أنجز مهامي اليومية بكفاءة.', 'أحقق نتائج صغيرة مستمرة.', 'ألتزم بالإجراءات.', 'أتابع عملي حتى يكتمل.'],
        needs: ['استخدام أداة لتتبع المهام اليومية', 'الاحتفاء بالإنجازات الصغيرة لتحفيز الاستمرارية', 'الالتزام الكامل بالإجراءات المعتمدة', 'تطوير عادة المتابعة حتى اكتمال العمل'] },
    ],
  },

  role: {
    id: 'role', title: 'مرحلة الدور', brand: '#e53935',
    goal: 'قياس قدرتك على تحمل المسؤولية وتحقيق نتائج واضحة في دورك المهني',
    axes: [
      { id: 'clarity',   title: 'وضوح المسؤولية',          color: AXIS_COLORS[0],
        questions: ['أفهم دوري ومسؤولياتي بدقة.', 'أعرف مؤشرات النجاح الخاصة بي.', 'أميز أولوياتي بوضوح.', 'لدي أهداف واضحة في عملي.'],
        needs: ['توثيق المهام والمسؤوليات في وثيقة واضحة', 'تحديد KPIs لكل هدف رئيسي', 'وضع مصفوفة أولويات (عاجل × مهم)', 'مراجعة الأهداف شهريًا مع المدير المباشر'] },
      { id: 'awareness', title: 'الوعي بالسياق المهني',     color: AXIS_COLORS[1],
        questions: ['أفهم كيف يؤثر عملي على الفريق.', 'أعرف متطلبات الجودة.', 'أفهم سياق العمل العام.', 'أعي التوقعات من الإدارة.'],
        needs: ['فهم دور وظيفتك في سلسلة القيمة الكاملة', 'التعرف على معايير الجودة المطلوبة بوضوح', 'الاطلاع على الأهداف الاستراتيجية للمؤسسة', 'التواصل الدوري مع الإدارة لفهم التوقعات'] },
      { id: 'decision',  title: 'جودة القرار',              color: AXIS_COLORS[2],
        questions: ['أستطيع اتخاذ قرارات في نطاق عملي.', 'أتعامل مع المشاكل بمرونة.', 'أوازن بين السرعة والجودة.', 'أتحمل نتائج قراراتي.'],
        needs: ['تعلم نماذج اتخاذ القرار (OODA, Eisenhower)', 'تطوير منهجية لحل المشكلات باحترافية', 'تحديد نقطة التوازن المثالية بين السرعة والجودة', 'بناء ثقافة التحمل الشخصي لنتائج القرار'] },
      { id: 'readiness', title: 'الجاهزية التخصصية',        color: AXIS_COLORS[3],
        questions: ['أمتلك مهارات تخصصية واضحة.', 'أستطيع إدارة وقتي بفعالية.', 'أتعامل مع ضغط العمل.', 'أطور نفسي بشكل مستمر.'],
        needs: ['تحديد الفجوات في المهارات التخصصية ومعالجتها', 'تطبيق نظام إدارة وقت موثوق (Pomodoro/GTD)', 'تطوير خطة لبناء المرونة تحت الضغط', 'الالتزام بساعة أسبوعية للتعلم الذاتي'] },
      { id: 'support',   title: 'شبكة العلاقات المهنية',    color: AXIS_COLORS[4],
        questions: ['لدي علاقات مهنية مفيدة.', 'أتعامل مع أصحاب القرار بشكل جيد.', 'أشارك في العمل الجماعي.', 'أبني سمعة مهنية جيدة.'],
        needs: ['بناء قاعدة علاقات مهنية داخلية وخارجية', 'تطوير مهارات التعامل مع الإدارة والمسؤولين', 'المشاركة الفعّالة في فرق العمل', 'بناء سمعة مبنية على الموثوقية والنتائج'] },
      { id: 'execution', title: 'الإنجاز والنتائج',         color: AXIS_COLORS[5],
        questions: ['أحقق نتائج قابلة للقياس.', 'ألتزم بالجودة.', 'أساهم في إنجاز الفريق.', 'أتابع الأعمال حتى نهايتها.'],
        needs: ['ربط كل مهمة بمؤشر قياسي واضح', 'وضع معايير جودة شخصية أعلى من المطلوب', 'الإسهام الفعّال في تحقيق أهداف الفريق', 'تطوير عادة الإغلاق الكامل لكل مهمة'] },
    ],
  },

  effective: {
    id: 'effective', title: 'مرحلة الفاعلية', brand: '#43a047',
    goal: 'قياس قدرتك على تحقيق تأثير ونتائج متقدمة في بيئة العمل',
    axes: [
      { id: 'clarity',   title: 'الرؤية والتوجه الاستراتيجي', color: AXIS_COLORS[0],
        questions: ['لدي رؤية واضحة لتطوري المهني.', 'أعرف كيف أحقق تأثيرًا أكبر.', 'أحدد أولوياتي الاستراتيجية.', 'أفهم دوري في تحقيق نتائج المؤسسة.'],
        needs: ['وضع خطة تطوير مهني لمدة 3 سنوات', 'تحديد المجالات التي يمكنك فيها تحقيق تأثير أعلى', 'تطوير آلية لترتيب الأولويات الاستراتيجية', 'فهم كيف يرتبط دورك بالنتائج المؤسسية الكبرى'] },
      { id: 'awareness', title: 'الوعي بالسوق والبيئة',     color: AXIS_COLORS[1],
        questions: ['أفهم السوق أو القطاع الذي أعمل فيه.', 'أتابع التغيرات المهنية.', 'أعي الفرص والتحديات.', 'أفهم المنافسة.'],
        needs: ['متابعة أحدث تقارير القطاع بشكل منتظم', 'الاشتراك في نشرات إخبارية متخصصة في مجالك', 'تحليل فرص السوق وتهديداته دوريًا', 'دراسة المنافسين وتعلم من تجاربهم'] },
      { id: 'decision',  title: 'جودة القرار الاستراتيجي',  color: AXIS_COLORS[2],
        questions: ['أتخذ قرارات مؤثرة.', 'أتعامل مع التغيير بمرونة.', 'أوازن بين المخاطر والفرص.', 'أقرر بناءً على نتائج وتحليل.'],
        needs: ['تعلم أدوات تحليل البيانات لدعم القرار', 'تطوير مرونة التعامل مع التغيير كفرصة', 'بناء إطار لتقييم المخاطر والفرص', 'الاعتماد على المنطق والبيانات لا على الحدس فقط'] },
      { id: 'readiness', title: 'الجاهزية القيادية',         color: AXIS_COLORS[3],
        questions: ['أمتلك مهارات قيادية.', 'أبتكر حلولًا.', 'أدير التغيير.', 'أطور نفسي باستمرار.'],
        needs: ['الالتحاق ببرنامج قيادي متخصص', 'تطوير منهجية للتفكير الإبداعي وحل المشكلات', 'بناء مهارات إدارة التغيير والتحول المؤسسي', 'وضع خطة تعلم مستدامة تشمل الكتب والمنتديات'] },
      { id: 'support',   title: 'شبكة التأثير',              color: AXIS_COLORS[4],
        questions: ['أملك شبكة علاقات قوية.', 'أؤثر في الآخرين.', 'أوجه الفريق.', 'أبني ثقة مع القيادات.'],
        needs: ['توسيع شبكة العلاقات خارج المؤسسة', 'تطوير مهارات الإقناع والتأثير', 'بناء مهارات التوجيه وتطوير الفريق', 'إنشاء قناة تواصل منتظمة مع القيادات'] },
      { id: 'execution', title: 'تحقيق النتائج المتقدمة',    color: AXIS_COLORS[5],
        questions: ['أحقق نتائج عالية.', 'أقود مبادرات.', 'أرفع جودة العمل.', 'أساهم في نجاح المؤسسة.'],
        needs: ['تحديد مبادرة واحدة قائدة لها تأثير كبير', 'رفع معايير الجودة الشخصية باستمرار', 'ربط إنجازاتك بنتائج المؤسسة القابلة للقياس', 'المشاركة في اتخاذ القرارات الاستراتيجية'] },
    ],
  },

  esteem: {
    id: 'esteem', title: 'مرحلة المكانة', brand: '#039be5',
    goal: 'قياس قدرتك على التأثير المؤسسي وصناعة القادة وبناء إرث مهني',
    axes: [
      { id: 'clarity',   title: 'وضوح الرؤية المؤسسية',   color: AXIS_COLORS[0],
        questions: ['لدي رؤية واضحة لتأثيري المؤسسي.', 'أعرف دوري القيادي.', 'أحدد أولوياتي على مستوى المؤسسة.', 'أفهم كيف أبني إرث مهني.'],
        needs: ['صياغة رؤية شخصية واضحة للتأثير المؤسسي', 'تعريف دورك القيادي بوضوح ومشاركته مع الفريق', 'تطوير أجندة استراتيجية على مستوى المؤسسة', 'التفكير في الإرث المهني وما تريد أن تتركه'] },
      { id: 'awareness', title: 'الوعي بالحوكمة والقيادة', color: AXIS_COLORS[1],
        questions: ['أفهم الحوكمة.', 'أعي ديناميكيات القيادة.', 'أفهم العلاقات الاستراتيجية.', 'أعي التحديات الكبرى.'],
        needs: ['دراسة مبادئ الحوكمة المؤسسية', 'فهم ديناميكيات القيادة وتوزيع السلطة', 'رسم خريطة للعلاقات الاستراتيجية الداخلية والخارجية', 'رصد التحديات الكبرى التي تواجه القطاع'] },
      { id: 'decision',  title: 'اتخاذ القرار الاستراتيجي', color: AXIS_COLORS[2],
        questions: ['أتخذ قرارات استراتيجية.', 'أتعامل مع صراعات المصالح.', 'أوازن بين الأطراف.', 'أتحمل قرارات كبيرة.'],
        needs: ['تطوير إطار شخصي لاتخاذ القرارات الاستراتيجية', 'بناء مهارات إدارة صراعات المصالح', 'تطوير القدرة على الموازنة بين مصالح الأطراف المختلفة', 'تقبل المسؤولية الكاملة عن القرارات الكبرى'] },
      { id: 'readiness', title: 'الجاهزية القيادية المتقدمة', color: AXIS_COLORS[3],
        questions: ['أمتلك مهارات قيادية متقدمة.', 'أبني فرق قوية.', 'أطور قيادات جديدة.', 'أتعامل مع الأزمات.'],
        needs: ['تطوير مهارات القيادة التحويلية', 'بناء منهجية لاختيار وتطوير الفريق', 'إنشاء برنامج لتطوير القيادات الواعدة', 'وضع خطة لإدارة الأزمات والسيناريوهات الصعبة'] },
      { id: 'support',   title: 'التحالفات والشبكات الاستراتيجية', color: AXIS_COLORS[4],
        questions: ['أملك تحالفات قوية.', 'أؤثر في أصحاب القرار.', 'أبني شبكات استراتيجية.', 'أوجه الآخرين.'],
        needs: ['تعزيز التحالفات مع الشركاء الاستراتيجيين', 'بناء قدرة التأثير في أصحاب القرار', 'توسيع الشبكة الاستراتيجية داخليًا وخارجيًا', 'تطوير مهارات الإرشاد والتوجيه للآخرين'] },
      { id: 'execution', title: 'التأثير والإرث المؤسسي',  color: AXIS_COLORS[5],
        questions: ['أقود مبادرات كبرى.', 'أحقق تأثير مؤسسي.', 'أساهم في الحوكمة.', 'أبني سمعة قوية.'],
        needs: ['قيادة مبادرة استراتيجية كبرى', 'قياس الأثر المؤسسي لمساهماتك', 'المشاركة الفعّالة في لجان الحوكمة', 'بناء سمعة مبنية على القيم والإنجاز'] },
    ],
  },

  retire: {
    id: 'retire', title: 'مرحلة التقاعد', brand: '#3949ab',
    goal: 'قياس قدرتك على تحويل الخبرة إلى إرث مستدام وتعيش مرحلة التقاعد بتوازن وعطاء',
    axes: [
      { id: 'clarity',   title: 'وضوح الرؤية للمرحلة',    color: AXIS_COLORS[0],
        questions: ['لدي تصور واضح لما بعد التقاعد.', 'أعرف كيف أستثمر خبرتي.', 'أحدد أهدافي المستقبلية.', 'أفهم معنى الإرث المهني.'],
        needs: ['رسم خريطة واضحة لحياة ما بعد التقاعد', 'تحديد المجالات التي يمكن توظيف خبرتك فيها', 'وضع أهداف قابلة للتحقيق للمرحلة القادمة', 'تأمل ما الإرث الذي تريد أن تتركه'] },
      { id: 'awareness', title: 'الوعي بخيارات المرحلة',  color: AXIS_COLORS[1],
        questions: ['أفهم خياراتي بعد التقاعد.', 'أعي الفرص المتاحة.', 'أفهم إدارة الثروة.', 'أعي التحديات النفسية.'],
        needs: ['استكشاف خيارات الاستشارة والتدريس والتأليف', 'البحث عن فرص التطوع والمساهمة المجتمعية', 'مراجعة الوضع المالي مع مستشار متخصص', 'التحضير النفسي للتكيف مع الهوية الجديدة'] },
      { id: 'decision',  title: 'جودة القرار للمستقبل',   color: AXIS_COLORS[2],
        questions: ['أتخذ قرارات طويلة المدى.', 'أوازن بين الراحة والعطاء.', 'أقرر بناءً على الاستدامة.', 'أتقبل التغيير.'],
        needs: ['وضع معيار واضح لقرارات المرحلة القادمة', 'إيجاد التوازن الصحي بين الراحة والإنتاجية', 'اعتماد مبدأ الاستدامة في كل قرار مالي وشخصي', 'تطوير مرونة قبول التغيير كجزء من الحياة'] },
      { id: 'readiness', title: 'الجاهزية للأدوار الجديدة', color: AXIS_COLORS[3],
        questions: ['أستطيع تقديم استشارات.', 'أنقل خبرتي للآخرين.', 'أتعلم أدوار جديدة.', 'أتكيف مع المرحلة.'],
        needs: ['بناء عرض استشاري للخدمات التي يمكنك تقديمها', 'إنشاء برنامج لنقل المعرفة والخبرة', 'الانفتاح على تعلم مهارات ودور جديدة', 'تطوير روتين يومي يتناسب مع متطلبات المرحلة'] },
      { id: 'support',   title: 'الشبكة الاجتماعية المستدامة', color: AXIS_COLORS[4],
        questions: ['لدي شبكة علاقات مستمرة.', 'أشارك في المجتمع.', 'أؤثر في الآخرين.', 'أحافظ على علاقاتي.'],
        needs: ['الحرص على الحفاظ على العلاقات المهنية والاجتماعية', 'الانضمام لمجموعات أو منتديات متخصصة', 'تخصيص وقت للتأثير في الجيل القادم', 'بناء روتين اجتماعي منتظم يحافظ على الارتباط بالآخرين'] },
      { id: 'execution', title: 'التوازن والإسهام',         color: AXIS_COLORS[5],
        questions: ['لدي مشاريع أو أنشطة.', 'أحقق دخل مستمر.', 'أساهم في المجتمع.', 'أعيش توازنًا صحيًا.'],
        needs: ['تحديد مشروع أو نشاط يمنح الهدف والمعنى', 'بناء مصدر دخل مستدام من الخبرة', 'وضع خطة مشاركة مجتمعية منتظمة', 'الاهتمام بالصحة الجسدية والنفسية بشكل متوازن'] },
    ],
  },
}

// ─── Level helpers ────────────────────────────────────────────────────────────
function axisLevel(score: number) {
  if (score >= 16) return { label: 'قوة واضحة',       color: '#388e3c' }
  if (score >= 11) return { label: 'جيد — يحتاج دعم', color: '#0288d1' }
  if (score >= 6)  return { label: 'فجوة تحتاج تدخل', color: '#f57c00' }
  return             { label: 'ضعف حرج',               color: '#c62828' }
}

function overallLevel(total: number, brand: string) {
  if (total >= 96) return { label: 'جاهزية عالية',    desc: 'أنت في مستوى ممتاز من الجاهزية لهذه المرحلة.', color: '#388e3c' }
  if (total >= 72) return { label: 'جاهزية متوسطة',   desc: 'تحتاج إلى تعزيز بعض المحاور مع توجيه مركّز.', color: '#0288d1' }
  if (total >= 48) return { label: 'جاهزية ناقصة',    desc: 'هناك فجوات واضحة تستحق الاهتمام والتطوير.', color: '#f57c00' }
  return             { label: 'تحتاج بناء أساس',       desc: 'ينصح بالبدء ببناء أسس هذه المرحلة من الصفر.', color: brand }
}

// ─── Likert row ───────────────────────────────────────────────────────────────
const LABELS_AR = ['لا تنطبق', 'قليلًا', 'متوسطة', 'كبيرة', 'تمامًا']

function LikertRow({ value, color, onChange, compact }: {
  value: number; color: string; onChange: (v: number) => void; compact?: boolean
}) {
  return (
    <div className={compact ? 'ca-likert-compact' : 'ca-likert-big'}>
      {[1,2,3,4,5].map(v => (
        <button key={v} type="button"
          onClick={() => onChange(v)}
          className={`${compact ? 'ca-likert-compact-btn' : 'ca-likert-big-btn'} ${value === v ? 'active' : ''}`}
          style={value === v ? { borderColor: color, background: `${color}12`, color } : {}}
        >
          <span className={compact ? 'ca-lc-val' : 'ca-likert-big-val'}>{v}</span>
          <span className={compact ? 'ca-lc-label' : 'ca-likert-big-label'}>{LABELS_AR[v - 1]}</span>
        </button>
      ))}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function StageAssessmentClient({ stageId }: { stageId: string }) {
  const stage = STAGES[stageId]
  const router = useRouter()

  const [authChecked, setAuthChecked] = useState(false)
  const [axisIndex, setAxisIndex] = useState(0)
  const [qIndex,    setQIndex]    = useState(0)
  const [answers,   setAnswers]   = useState<number[]>(Array(24).fill(0))
  const [step,      setStep]      = useState<'questions' | 'loading' | 'results'>('questions')
  const [aiReport,  setAiReport]  = useState<{ strengths: string[]; weaknesses: string[]; recommendation: string } | null>(null)
  const [dir,       setDir]       = useState(1)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.replace(`/login?next=/assessment/${stageId}`)
      else setAuthChecked(true)
    })
  }, [router, stageId])

  if (!authChecked) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="spinner" />
    </div>
  )

  if (!stage) return <div style={{ textAlign: 'center', padding: 80 }}>مرحلة غير موجودة</div>

  const BRAND = stage.brand
  const AXES  = stage.axes

  const axis        = AXES[axisIndex]
  const globalIdx   = axisIndex * 4 + qIndex
  const currentAns  = answers[globalIdx]
  const isLastAxis  = axisIndex === AXES.length - 1
  const isLastQ     = qIndex === 3
  const axisAnswers = answers.slice(axisIndex * 4, axisIndex * 4 + 4)
  const axisComplete = axisAnswers.every(a => a > 0)
  const axisFirstQ  = axisIndex * 4 + 1
  const axisLastQ   = axisIndex * 4 + 4

  const setAnswer = (qi: number, val: number) =>
    setAnswers(prev => { const n = [...prev]; n[axisIndex * 4 + qi] = val; return n })

  const mobileNext = () => {
    setDir(1)
    if (!isLastQ) { setQIndex(q => q + 1); return }
    if (!isLastAxis) { setAxisIndex(a => a + 1); setQIndex(0); return }
    handleSubmit()
  }
  const mobilePrev = () => {
    setDir(-1)
    if (qIndex > 0) { setQIndex(q => q - 1); return }
    if (axisIndex > 0) { setAxisIndex(a => a - 1); setQIndex(3); return }
  }
  const desktopNext = () => {
    setDir(1)
    if (!isLastAxis) { setAxisIndex(a => a + 1); setQIndex(0); return }
    handleSubmit()
  }
  const desktopPrev = () => {
    setDir(-1)
    if (axisIndex > 0) { setAxisIndex(a => a - 1); setQIndex(0) }
  }

  const handleSubmit = async () => {
    setStep('loading')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    try {
      const axisScores = AXES.map((ax, ai) => ({
        title: ax.title,
        score: answers.slice(ai * 4, ai * 4 + 4).reduce((s, v) => s + v, 0),
      }))
      const total = axisScores.reduce((s, a) => s + a.score, 0)
      const res = await fetch('/api/assessment/stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stageId: stage.id, stageTitle: stage.title, axisScores, total }),
      })
      const json = await res.json()
      if (!json.error) setAiReport(json.report)
    } catch { /* fallback to static */ }
    setStep('results')
  }

  const resetAssessment = () => {
    setStep('questions'); setAxisIndex(0); setQIndex(0)
    setAnswers(Array(24).fill(0)); setAiReport(null)
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (step === 'loading') {
    return (
      <div className="ca-page" dir="rtl">
        <div className="ca-loading">
          <div className="ca-spinner" />
          <p>الذكاء الاصطناعي يحلل نتائجك...</p>
          <span>بضع ثوانٍ فقط</span>
        </div>
      </div>
    )
  }

  // ── Results ───────────────────────────────────────────────────────────────
  if (step === 'results') {
    const axisScores  = AXES.map((_, ai) => answers.slice(ai * 4, ai * 4 + 4).reduce((s, v) => s + v, 0))
    const total       = axisScores.reduce((s, v) => s + v, 0)
    const overall     = overallLevel(total, BRAND)
    const needAxes    = AXES.filter((_, i) => axisScores[i] < 16)
    const radarScores = axisScores.map(s => Math.round((s / 20) * 100))
    const strengths   = aiReport?.strengths   ?? AXES.filter((_, i) => axisScores[i] >= 16).map(a => `قوة واضحة في محور "${a.title}"`)
    const weaknesses  = aiReport?.weaknesses  ?? AXES.filter((_, i) => axisScores[i] <  16).map(a => `${axisLevel(axisScores[AXES.indexOf(a)]).label} في محور "${a.title}"`)
    const recommendation = aiReport?.recommendation ?? 'راجع محاور الضعف وابدأ بالخطوات العملية المقترحة لكل محور.'

    return (
      <div className="ca-page" dir="rtl">
        <div className="ca-header" style={{ borderBottom: `4px solid ${overall.color}` }}>
          <div className="ca-header-inner">
            <div>
              <p className="ca-header-label">{stage.title}</p>
              <h1>نتائجك</h1>
            </div>
            <div className="ca-score-circle" style={{ borderColor: overall.color }}>
              <span style={{ color: overall.color }}>{total}</span>
              <small>/ 120</small>
            </div>
          </div>
        </div>

        <div className="ca-results-content">
          <motion.div className="ca-overall-badge" style={{ borderColor: overall.color, background: `${overall.color}08` }}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="ca-overall-dot" style={{ background: overall.color }} />
            <div>
              <p className="ca-badge-sub">مستوى الجاهزية الكلية</p>
              <p className="ca-badge-title" style={{ color: overall.color }}>{overall.label}</p>
              <p className="ca-badge-desc">{overall.desc}</p>
            </div>
          </motion.div>

          <div className="ca-grid">
            <motion.div className="ca-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
              <h2>الرادار المهني</h2>
              <div className="ca-radar-wrap">
                <RadarChart scores={radarScores} labels={AXES.map(a => a.title.split(' ')[0])} colors={AXES.map(a => a.color)} />
              </div>
            </motion.div>

            <motion.div className="ca-card" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
              <h2>النتائج حسب المحاور</h2>
              <div className="ca-bars">
                {AXES.map((ax, i) => {
                  const lv = axisLevel(axisScores[i])
                  return (
                    <div key={ax.id} className="ca-bar-row">
                      <div className="ca-bar-header">
                        <span className="ca-bar-name">{ax.title}</span>
                        <span className="ca-bar-val" style={{ color: lv.color }}>{axisScores[i]}/20</span>
                      </div>
                      <div className="ca-bar-track">
                        <motion.div className="ca-bar-fill" style={{ background: lv.color }}
                          initial={{ width: 0 }} animate={{ width: `${(axisScores[i] / 20) * 100}%` }} transition={{ duration: 0.7, ease: 'easeOut' }} />
                      </div>
                      <span className="ca-bar-tag" style={{ background: `${lv.color}15`, color: lv.color }}>{lv.label}</span>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </div>

          <motion.div className="ca-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2>التقرير التفصيلي</h2>

            {strengths.length > 0 && (
              <div className="ca-report-block" style={{ borderColor: '#388e3c30', background: '#388e3c06' }}>
                <p className="ca-report-title" style={{ color: '#388e3c' }}>💪 نقاط القوة</p>
                <ul>{strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>
            )}
            {weaknesses.length > 0 && (
              <div className="ca-report-block" style={{ borderColor: '#c6282830', background: '#c6282806' }}>
                <p className="ca-report-title" style={{ color: '#c62828' }}>⚠️ مجالات التطوير</p>
                <ul>{weaknesses.map((w, i) => <li key={i}>{w}</li>)}</ul>
              </div>
            )}
            {needAxes.length > 0 && (
              <div className="ca-report-block ca-report-neutral">
                <p className="ca-report-title ca-report-title-neutral">📈 الاحتياج التطويري حسب المحور</p>
                {needAxes.map(ax => (
                  <div key={ax.id} className="ca-need-axis">
                    <p className="ca-need-title">{ax.title}</p>
                    <ul>{ax.needs.map((n, i) => <li key={i}>{n}</li>)}</ul>
                  </div>
                ))}
              </div>
            )}
            <div className="ca-report-block ca-report-recommendation">
              <p className="ca-report-title ca-report-title-rec">🎯 التوصية النهائية</p>
              <p className="ca-recommendation">{recommendation}</p>
            </div>
          </motion.div>

          <div className="ca-actions">
            <button onClick={resetAssessment} className="ca-btn-outline">← إعادة الاستبيان</button>
            <button onClick={() => window.print()} className="ca-btn-outline ca-btn-print">🖨️ طباعة / PDF</button>
            <Link href="/" className="ca-btn-primary">الرئيسية ←</Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Questions ─────────────────────────────────────────────────────────────
  const answeredCount = answers.filter(a => a > 0).length
  const progressPct   = Math.round((answeredCount / 24) * 100)

  return (
    <div className="ca-page" dir="rtl">

      {/* ══ MOBILE ══════════════════════════════════════════════════════════ */}
      <div className="ca-mobile-view">
        <div className="ca-topbar">
          <div className="ca-topbar-inner">
            <div className="ca-progress-track">
              <div className="ca-progress-fill" style={{ width: `${progressPct}%`, background: BRAND }} />
            </div>
            <div className="ca-topbar-meta">
              <span className="ca-axis-pill-inline">{axis.title}</span>
              <span className="ca-progress-label" style={{ color: BRAND, fontWeight: 600 }}>
                السؤال {globalIdx + 1} / 24
              </span>
            </div>
          </div>
        </div>

        <div className="ca-q-wrap">
          <AnimatePresence mode="wait">
            <motion.div key={globalIdx}
              initial={{ opacity: 0, x: dir * 30 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -dir * 30 }} transition={{ duration: 0.2 }}
              className="ca-q-card"
            >
              <p className="ca-q-text-big">{axis.questions[qIndex]}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <LikertRow value={currentAns} color={BRAND} onChange={v => setAnswer(qIndex, v)} />

        <div className="ca-bottom-nav">
          {axisIndex === 0 && qIndex === 0
            ? <Link href="/" className="ca-nav-back">← رجوع</Link>
            : <button onClick={mobilePrev} className="ca-nav-back">← السابق</button>
          }
          <button onClick={mobileNext} disabled={!currentAns} className="ca-nav-next"
            style={currentAns ? { background: BRAND } : {}}>
            {isLastAxis && isLastQ ? 'عرض النتائج ←' : 'التالي ←'}
          </button>
        </div>
      </div>

      {/* ══ DESKTOP ═════════════════════════════════════════════════════════ */}
      <div className="ca-desktop-view">
        <div className="ca-desktop-header">
          <div className="ca-desktop-header-inner">
            <div className="ca-desktop-steps">
              {AXES.map((ax, i) => (
                <div key={ax.id}
                  className={`ca-desktop-dot ${i === axisIndex ? 'active' : i < axisIndex ? 'done' : ''}`}
                  title={ax.title} />
              ))}
            </div>
            <div className="ca-desktop-counters">
              <span className="ca-desktop-counter-main" style={{ color: BRAND }}>
                الأسئلة {axisFirstQ}–{axisLastQ} من 24
              </span>
              <span className="ca-desktop-counter-sub">
                المحور {axisIndex + 1} / {AXES.length}
              </span>
            </div>
          </div>
          <div className="ca-progress-track ca-progress-desktop">
            <div className="ca-progress-fill" style={{ width: `${progressPct}%`, background: BRAND }} />
          </div>
        </div>

        <div className="ca-desktop-body">
          <AnimatePresence mode="wait">
            <motion.div key={axisIndex}
              initial={{ opacity: 0, x: dir * 24 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -dir * 24 }} transition={{ duration: 0.25 }}
              className="ca-desktop-card"
            >
              <div className="ca-desktop-axis-header">
                <div className="ca-desktop-axis-num" style={{ background: BRAND }}>{axisIndex + 1}</div>
                <div>
                  <p className="ca-desktop-axis-sub">المحور</p>
                  <p className="ca-desktop-axis-title">{axis.title}</p>
                </div>
                <div className="ca-desktop-legend">
                  {[1,2,3,4,5].map(v => (
                    <span key={v}><strong>{v}</strong> {LABELS_AR[v-1]}</span>
                  ))}
                </div>
              </div>

              <div className="ca-desktop-questions">
                {axis.questions.map((q, qi) => (
                  <div key={qi} className="ca-desktop-q-row">
                    <p className="ca-desktop-q-text">
                      <span className="ca-desktop-q-num" style={{ color: BRAND }}>
                        {axisIndex * 4 + qi + 1}
                      </span>
                      {q}
                    </p>
                    <LikertRow value={axisAnswers[qi]} color={BRAND} onChange={v => setAnswer(qi, v)} compact />
                  </div>
                ))}
              </div>

              <div className="ca-desktop-nav">
                {axisIndex === 0
                  ? <Link href="/" className="ca-btn-outline">← رجوع</Link>
                  : <button onClick={desktopPrev} className="ca-btn-outline">← السابق</button>
                }
                <button onClick={desktopNext} disabled={!axisComplete} className="ca-btn-primary"
                  style={axisComplete ? { background: BRAND } : {}}>
                  {isLastAxis ? 'عرض النتائج ←' : 'التالي ←'}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

    </div>
  )
}
