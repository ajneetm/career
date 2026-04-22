// ─── Career stages ────────────────────────────────────────────────────────────
export type StageKey = 'choice' | 'adapt' | 'role' | 'effective' | 'esteem' | 'retire'

export const STAGES: { key: StageKey; labelAr: string; labelEn: string; color: string; age: string }[] = [
  { key: 'choice',    labelAr: 'الاختيار',  labelEn: 'Choice',    color: '#fbc02d', age: '15+' },
  { key: 'adapt',     labelAr: 'التأقلم',   labelEn: 'Adapt',     color: '#f57c00', age: '22+' },
  { key: 'role',      labelAr: 'الدور',     labelEn: 'Role',      color: '#d32f2f', age: '23+' },
  { key: 'effective', labelAr: 'الفاعلية',  labelEn: 'Effective', color: '#388e3c', age: '30+' },
  { key: 'esteem',    labelAr: 'المكانة',   labelEn: 'Esteem',    color: '#0288d1', age: '40+' },
  { key: 'retire',    labelAr: 'التقاعد',   labelEn: 'Retire',    color: '#1565c0', age: '60+' },
]

// ─── Positions ────────────────────────────────────────────────────────────────
export const POSITIONS_AR = [
  'لا يعمل',
  'موظف جديد',
  'موظف جونيور',
  'موظف سينيور',
  'رئيس قسم',
  'رئيس وحدة',
  'مدير إدارة',
  'رئيس قطاع',
  'منصب قيادي أعلى',
]

export const POSITIONS_EN = [
  'Not working',
  'New employee',
  'Junior employee',
  'Senior employee',
  'Head of department',
  'Unit manager',
  'Division manager',
  'Sector head',
  'Senior leadership',
]

// ─── 21 Questions ─────────────────────────────────────────────────────────────
// Each question maps to a career stage (3 questions × 6 stages = 18, + 3 overall)
// Mapping: choice[0,6,12] adapt[1,7,13] role[2,8,14] effective[3,9,15] esteem[4,10,16] retire[5,11,17]
// Questions 18,19,20 = overall awareness

export interface Question {
  id: number        // 0-based index
  stage: StageKey | 'overall'
  sectionAr: string
  sectionEn: string
  textAr: string
  textEn: string
}

export const QUESTIONS: Question[] = [
  // ── Section 1: Career Path Awareness ──────────────────────────────────────
  { id: 0,  stage: 'choice',    sectionAr: 'الوعي بالمسار المهني',         sectionEn: 'Career Path Awareness',       textAr: 'لدي رؤية واضحة للمهنة أو الوظيفة التي أسعى إليها مستقبلاً.',                                              textEn: 'I have a clear vision of the career or job I am striving for in the future.' },
  { id: 1,  stage: 'adapt',     sectionAr: 'الوعي بالمسار المهني',         sectionEn: 'Career Path Awareness',       textAr: 'أفهم بشكل واضح طبيعة عملي المستقبلي (المجال – الدور – بيئة العمل).',                                      textEn: 'I clearly understand the nature of my future work (field, role, work environment).' },
  { id: 2,  stage: 'role',      sectionAr: 'الوعي بالمسار المهني',         sectionEn: 'Career Path Awareness',       textAr: 'أستطيع تحديد الأدوار الوظيفية التي أطمح للوصول إليها خلال رحلتي المهنية.',                                  textEn: 'I can identify the job roles I aspire to reach during my career journey.' },
  { id: 3,  stage: 'effective', sectionAr: 'الوعي بالمسار المهني',         sectionEn: 'Career Path Awareness',       textAr: 'أراجع أهدافي المهنية بشكل دوري لضمان توافقها مع خططي طويلة المدى.',                                        textEn: 'I periodically review my career goals to ensure alignment with my long-term plans.' },
  { id: 4,  stage: 'esteem',    sectionAr: 'الوعي بالمسار المهني',         sectionEn: 'Career Path Awareness',       textAr: 'لدي تصور إيجابي وواضح لحياتي المهنية بعد التقاعد.',                                                        textEn: 'I have a positive and clear vision of my professional life after retirement.' },
  { id: 5,  stage: 'retire',    sectionAr: 'الوعي بالمسار المهني',         sectionEn: 'Career Path Awareness',       textAr: 'أشعر بالثقة بأن مساري المهني الحالي يقودني نحو مستقبلي الذي أطمح إليه.',                                    textEn: 'I am confident that my current career path is leading me toward the future I aspire to.' },

  // ── Section 2: Challenges & Opportunities ─────────────────────────────────
  { id: 6,  stage: 'choice',    sectionAr: 'التحديات والفرص',               sectionEn: 'Challenges & Opportunities',  textAr: 'أمتلك المهارات الفنية الأساسية اللازمة للنجاح في مجالي المهني.',                                          textEn: 'I have the core technical skills needed to succeed in my professional field.' },
  { id: 7,  stage: 'adapt',     sectionAr: 'التحديات والفرص',               sectionEn: 'Challenges & Opportunities',  textAr: 'أتمتع بمهارات تواصل قوية تساعدني في بناء شبكة علاقات مهنية.',                                              textEn: 'I have strong communication skills that help me build a professional network.' },
  { id: 8,  stage: 'role',      sectionAr: 'التحديات والفرص',               sectionEn: 'Challenges & Opportunities',  textAr: 'أستطيع تحديد الفرص المهنية المتاحة في سوق العمل والتخطيط للاستفادة منها.',                                  textEn: 'I can identify available career opportunities in the job market and plan to leverage them.' },
  { id: 9,  stage: 'effective', sectionAr: 'التحديات والفرص',               sectionEn: 'Challenges & Opportunities',  textAr: 'أتمكن من إدارة أولوياتي بفعالية رغم الضغوط المالية أو الاجتماعية.',                                        textEn: 'I can effectively manage my priorities despite financial or social pressures.' },
  { id: 10, stage: 'esteem',    sectionAr: 'التحديات والفرص',               sectionEn: 'Challenges & Opportunities',  textAr: 'لدي خطة واضحة لتطوير نقاط قوتي لدعم مساري المهني.',                                                      textEn: 'I have a clear plan to develop my strengths to support my career path.' },
  { id: 11, stage: 'retire',    sectionAr: 'التحديات والفرص',               sectionEn: 'Challenges & Opportunities',  textAr: 'أدرك نقاط ضعفي وأسعى بجدية لمعالجتها وتطويرها.',                                                        textEn: 'I am aware of my weaknesses and actively work to address and develop them.' },

  // ── Section 3: Professional Skills & Behaviors ────────────────────────────
  { id: 12, stage: 'choice',    sectionAr: 'المهارات والسلوكيات المهنية',   sectionEn: 'Professional Skills',         textAr: 'أتعلم بسرعة عند دخولي مجالاً أو دوراً وظيفياً جديداً.',                                                   textEn: 'I learn quickly when entering a new field or job role.' },
  { id: 13, stage: 'adapt',     sectionAr: 'المهارات والسلوكيات المهنية',   sectionEn: 'Professional Skills',         textAr: 'أتحمل المسؤولية الكاملة عن نتائج عملي حتى في الظروف الصعبة.',                                              textEn: 'I take full responsibility for the results of my work, even in difficult circumstances.' },
  { id: 14, stage: 'role',      sectionAr: 'المهارات والسلوكيات المهنية',   sectionEn: 'Professional Skills',         textAr: 'أستطيع الموازنة بين الجودة والسرعة عند إنجاز المهام.',                                                    textEn: 'I can balance quality and speed when completing tasks.' },
  { id: 15, stage: 'effective', sectionAr: 'المهارات والسلوكيات المهنية',   sectionEn: 'Professional Skills',         textAr: 'أعمل باستمرار على بناء سمعة مهنية قائمة على المصداقية والنتائج.',                                          textEn: 'I continuously work on building a professional reputation based on credibility and results.' },
  { id: 16, stage: 'esteem',    sectionAr: 'المهارات والسلوكيات المهنية',   sectionEn: 'Professional Skills',         textAr: 'أشارك خبرتي مع الآخرين وأسهم في تمكين زملائي.',                                                          textEn: 'I share my expertise with others and contribute to empowering my colleagues.' },
  { id: 17, stage: 'retire',    sectionAr: 'المهارات والسلوكيات المهنية',   sectionEn: 'Professional Skills',         textAr: 'لدي رؤية عملية لنقل خبرتي ومعرفتي للأجيال القادمة بعد التقاعد.',                                          textEn: 'I have a practical vision for transferring my expertise and knowledge to future generations.' },

  // ── Section 4: Workshop Expectations ──────────────────────────────────────
  { id: 18, stage: 'overall',   sectionAr: 'توقعات ورشة العمل',             sectionEn: 'Workshop Expectations',       textAr: 'أتوقع أن تمنحني الورشة وضوحاً أكبر حول مساري المهني.',                                                   textEn: 'I expect the workshop to give me greater clarity about my career path.' },
  { id: 19, stage: 'overall',   sectionAr: 'توقعات ورشة العمل',             sectionEn: 'Workshop Expectations',       textAr: 'أتوقع أن تساعدني الورشة في تصميم خطة مهنية قابلة للتطبيق.',                                              textEn: 'I expect the workshop to help me design an actionable career plan.' },
  { id: 20, stage: 'overall',   sectionAr: 'توقعات ورشة العمل',             sectionEn: 'Workshop Expectations',       textAr: 'أتوقع أن أكتشف أدوات جديدة لتخطيط وتطوير مساري المهني.',                                                textEn: 'I expect to discover new tools for planning and developing my career path.' },
]

// ─── Score calculation ─────────────────────────────────────────────────────────
export function calculateScores(answers: number[]) {
  const stageKeys: StageKey[] = ['choice', 'adapt', 'role', 'effective', 'esteem', 'retire']

  // 3 questions per stage (indices: stage_index, stage_index+6, stage_index+12)
  const stageScores: Record<StageKey, number> = {} as any
  stageKeys.forEach((key, i) => {
    const q1 = answers[i]      ?? 3
    const q2 = answers[i + 6]  ?? 3
    const q3 = answers[i + 12] ?? 3
    stageScores[key] = Math.round(((q1 + q2 + q3) / 15) * 100)
  })

  // Overall = average of all 21 answers
  const sum = answers.reduce((a, b) => a + b, 0)
  const overall = Math.round((sum / (answers.length * 5)) * 100)

  return { stageScores, overall }
}

// ─── Determine current career stage from profile ──────────────────────────────
export function determineCurrentStage(age: number, yearsExp: number, position: string): StageKey {
  const positionIndex = POSITIONS_AR.indexOf(position)

  // Score: يجمع عدة عوامل لتحديد المرحلة بدقة
  // Retire: عمر 60+ أو منصب قيادي أعلى مع خبرة كافية
  if (age >= 60 || (positionIndex >= 8 && yearsExp >= 20)) return 'retire'

  // Esteem: عمر 40+ أو منصب رفيع مع خبرة 15+ سنة
  if (age >= 40 || (positionIndex >= 6 && yearsExp >= 15)) return 'esteem'

  // Effective: عمر 30+ أو منصب قيادي مع خبرة 10+ سنة
  if (age >= 30 || (positionIndex >= 5 && yearsExp >= 10)) return 'effective'

  // Role: عمر 25+ أو خبرة 5+ سنوات مع منصب جيد
  if (age >= 25 || yearsExp >= 5 || (positionIndex >= 3 && yearsExp >= 3)) return 'role'

  // Adapt: عمر 22+ أو بدأ العمل
  if (age >= 22 || positionIndex >= 1) return 'adapt'

  return 'choice'
}

// ─── Interpretation ───────────────────────────────────────────────────────────
export function interpretScore(score: number, lang: 'ar' | 'en'): string {
  if (lang === 'ar') {
    if (score >= 90) return 'وعي مهني مرتفع جداً – جاهزية عالية ووضوح مهني متكامل'
    if (score >= 70) return 'وعي جيد – يحتاج إلى صقل المهارات وتطوير موجّه'
    if (score >= 50) return 'وعي متوسط – يتطلب إرشاداً منظماً ومتابعة تطويرية'
    if (score >= 30) return 'وعي منخفض – يحتاج إلى تدريب مكثف وإشراف مباشر'
    return 'وعي ضعيف جداً – يتطلب إعادة توجيه مهني وإرشاد عميق'
  }
  if (score >= 90) return 'Very high career awareness – high readiness and integrated clarity'
  if (score >= 70) return 'Good awareness – needs skill refinement and guided development'
  if (score >= 50) return 'Moderate awareness – requires structured guidance and follow-up'
  if (score >= 30) return 'Low awareness – needs intensive training and direct supervision'
  return 'Very low awareness – requires career redirection and deep guidance'
}

export const SECTION_LABELS_AR = ['الوعي بالمسار المهني', 'التحديات والفرص', 'المهارات والسلوكيات المهنية', 'توقعات ورشة العمل']
export const SECTION_LABELS_EN = ['Career Path Awareness', 'Challenges & Opportunities', 'Professional Skills & Behaviors', 'Workshop Expectations']
