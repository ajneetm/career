import type { ReactNode } from 'react';

import type { Locale } from '@/lib/i18n/types';

export type CareerStageContent = {
  svg: ReactNode;
  color: string;
  title: string;
  desc: string;
  action: string;
};

const letterSvgs: Record<string, ReactNode> = {
  choice: (
    <svg width="120" height="120" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="currentColor" rx="4" />
      <text x="50%" y="72%" textAnchor="middle" fontSize="70" fontWeight="400" fill="white">
        C
      </text>
    </svg>
  ),
  adapt: (
    <svg width="120" height="120" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="currentColor" rx="4" />
      <text x="50%" y="72%" textAnchor="middle" fontSize="70" fontWeight="400" fill="white">
        A
      </text>
    </svg>
  ),
  role: (
    <svg width="120" height="120" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="currentColor" rx="4" />
      <text x="50%" y="72%" textAnchor="middle" fontSize="70" fontWeight="400" fill="white">
        R
      </text>
    </svg>
  ),
  effective: (
    <svg width="120" height="120" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="currentColor" rx="4" />
      <text x="50%" y="72%" textAnchor="middle" fontSize="70" fontWeight="400" fill="white">
        E
      </text>
    </svg>
  ),
  esteem: (
    <svg width="120" height="120" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="currentColor" rx="4" />
      <text x="50%" y="72%" textAnchor="middle" fontSize="70" fontWeight="400" fill="white">
        E
      </text>
    </svg>
  ),
  retire: (
    <svg width="120" height="120" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="currentColor" rx="4" />
      <text x="50%" y="72%" textAnchor="middle" fontSize="70" fontWeight="400" fill="white">
        R
      </text>
    </svg>
  ),
};

const enStages: Record<string, Omit<CareerStageContent, 'svg'>> = {
  choice: {
    color: 'var(--yellow)',
    title: 'Choice Stage',
    desc: "Do you feel that your career direction is not yet clear? In this stage, we help you understand your inclinations, explore suitable options, and make an informed initial decision without haste or wasting time.",
    action:
      'I invite you to participate in the Career Path Workshop to start from the right step, or book a consultation hour to guide your decision with confidence.',
  },
  adapt: {
    color: 'var(--orange)',
    title: 'Adapt Stage',
    desc: 'Have you entered a new work environment and want to prove yourself quickly? We help you understand work expectations, build discipline, and acquire the basic skills for steady integration.',
    action:
      'Participate in the Career Path Workshop to speed up your integration, or benefit from a consultation session to arrange your career priorities.',
  },
  role: {
    color: 'var(--red)',
    title: 'Role Stage',
    desc: 'Is your role clear, but your results are not appreciated as they should be? In this stage, we focus on stabilizing your responsibilities and turning your effort into clear outputs measured by results.',
    action:
      'Join the workshop to stabilize your professional role, or book a consultation hour to build a reliable professional reputation.',
  },
  effective: {
    color: 'var(--green)',
    title: 'Effective Stage',
    desc: 'Do you work a lot but feel that the impact of your work does not show? We help you improve priorities, measure performance, and achieve sustainable results without exhaustion.',
    action:
      'Participate in the Career Path Workshop to amplify your impact, or book a consultation session to redesign your way of working.',
  },
  esteem: {
    color: 'var(--light-blue)',
    title: 'Esteem Stage',
    desc: 'Have you become a reference or a leader, but you are looking for a wider impact? In this stage, we help you expand your institutional influence, build methodologies, and develop others.',
    action:
      'The workshop helps you consolidate your position, and the consultation hour enables you to manage your influence and boundaries with awareness.',
  },
  retire: {
    color: 'var(--dark-blue)',
    title: 'Retirement Stage',
    desc: 'Are you thinking about what comes after the job? We help you transform your experience into continuous value through consultation, mentoring, or knowledge transfer, without losing meaning or identity.',
    action:
      'Participate in the Career Path Workshop to redesign your next role, or book a consultation session to draw a new chapter with a balanced rhythm.',
  },
};

const arStages: Record<string, Omit<CareerStageContent, 'svg'>> = {
  choice: {
    color: 'var(--yellow)',
    title: 'مرحلة الاختيار',
    desc: 'هل تشعر أن اتجاهك المهني ما زال غير واضح؟ في هذه المرحلة نساعدك على فهم ميولك، واستكشاف الخيارات المناسبة، واتخاذ قرار أولي مدروس دون عجلة أو إضاعة للوقت.',
    action:
      'أدعوك للمشاركة في ورشة المسار المهني لتبدأ من الخطوة الصحيحة، أو لحجز ساعة استشارة لتوجيه قرارك بثقة.',
  },
  adapt: {
    color: 'var(--orange)',
    title: 'مرحلة التأقلم',
    desc: 'هل دخلت بيئة عمل جديدة وترغب بإثبات نفسك بسرعة؟  نساعدك على فهم توقعات العمل، وبناء الانضباط، واكتساب المهارات الأساسية للاندماج بثبات.',
    action:
      'انضم لورشة المسار المهني لتسريع اندماجك، أو استفد من جلسة استشارية لترتيب أولوياتك المهنية.',
  },
  role: {
    color: 'var(--red)',
    title: 'مرحلة الدور',
    desc: 'هل دورك واضح لكن نتائجك لا تُقدَّر كما يجب؟  نركز هنا على تثبيت مسؤولياتك وتحويل جهدك إلى مخرجات واضحة تقاس بالنتائج.',
    action:
      'انضم للورشة لتثبيت دورك المهني، أو احجز استشارة لبناء سمعة مهنية موثوقة.',
  },
  effective: {
    color: 'var(--green)',
    title: 'مرحلة الفعالية',
    desc: 'هل تعمل كثيرًا لكنك تشعر أن أثر عملك لا يظهر؟  نساعدك على تحسين الأولويات، وقياس الأداء، وتحقيق نتائج مستدامة دون إرهاق.',
    action:
      'شارك في ورشة المسار المهني لتضخيم أثرك، أو احجز استشارة لإعادة تصميم أسلوب عملك.',
  },
  esteem: {
    color: 'var(--light-blue)',
    title: 'مرحلة الاعتماد والتقدير',
    desc: 'هل أصبحت مرجعًا أو قائدًا وتبحث عن أثر أوسع؟  نساعدك على توسيع نفوذك المؤسسي، وبناء منهجيات، وتطوير الآخرين.',
    action:
      'الورشة تساعدك على تثبيت مكانتك، وساعة الاستشارة تمكّنك من إدارة نفوذك وحدودك بوعي.',
  },
  retire: {
    color: 'var(--dark-blue)',
    title: 'مرحلة ما بعد العمل',
    desc: 'هل تفكر بما بعد الوظيفة؟  نساعدك على تحويل خبرتك إلى قيمة مستمرة عبر الاستشارة أو الإرشاد أو نقل المعرفة، دون فقدان المعنى أو الهوية.',
    action:
      'شارك في ورشة المسار المهني لإعادة تصميم دورك التالي، أو احجز استشارة لرسم فصل جديد بإيقاع متوازن.',
  },
};

const copy: Record<Locale, Record<string, Omit<CareerStageContent, 'svg'>>> = {
  en: enStages,
  ar: arStages,
};

export function getCareerStage(id: string, locale: Locale): CareerStageContent | null {
  const key = id.toLowerCase();
  const base = copy[locale][key];
  if (!base) return null;
  const svg = letterSvgs[key];
  if (!svg) return null;
  return { ...base, svg };
}

export const careerStageIds = Object.keys(letterSvgs);
