import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

async function callGemini(prompt: string): Promise<string> {
  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 1500, temperature: 0.4, responseMimeType: 'application/json' },
    }),
  })
  const json = await res.json()
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

export async function POST(req: NextRequest) {
  try {
    const { age, yearsExperience, position, language = 'ar' } = await req.json()

    const prompt = language === 'ar'
      ? `أنت خبير في نموذج أجني للمسار المهني (CAREER) الذي يتكون من 6 مراحل:
1. الاختيار (Choice) - سن 15+ : اكتشاف الميول، اختيار التخصص
2. التأقلم (Adapt) - سن 22+ : الدخول لسوق العمل، فهم بيئة العمل
3. الدور (Role) - سن 23+ : إتقان العمل، تحمل المسؤولية، الإنجاز
4. الفاعلية (Effective) - سن 30+ : تحقيق أثر ملموس، ابتكار، قيادة
5. المكانة (Esteem) - سن 40+ : تمكين الآخرين، صناعة الفارق المؤسسي
6. التقاعد (Retire) - سن 60+ : نقل المعرفة، بناء الإرث

بيانات المشارك:
- العمر: ${age} سنة
- سنوات الخبرة: ${yearsExperience} سنة
- المنصب الحالي: ${position}

مهمتك: ولّد 15 سؤالاً مخصصاً لهذه الحالة بالضبط لتحديد مرحلته الفعلية.
- يجب أن تكون الأسئلة مناسبة لعمره ومنصبه وخبرته
- ركّز على المراحل المحتملة لهذه الحالة (لا تسأل عن التقاعد لشخص عمره 23)
- كل سؤال يقيس بُعداً مختلفاً من أبعاد المراحل

أرجع JSON فقط بهذا الشكل بدون أي نص آخر:
[
  {"id": 1, "text": "نص السؤال", "stage": "role"},
  ...
]

المراحل المتاحة: choice, adapt, role, effective, esteem, retire`
      : `You are an expert in the Ajnee Career Pathway Model (CAREER) with 6 stages:
1. Choice - 15+: discovering interests, choosing specialization
2. Adapt - 22+: entering the workforce, understanding work culture
3. Role - 23+: mastering work, taking responsibility
4. Effective - 30+: creating impact, innovation, leadership
5. Esteem - 40+: empowering others, institutional impact
6. Retire - 60+: transferring knowledge, building legacy

Participant data:
- Age: ${age}
- Years of experience: ${yearsExperience}
- Current position: ${position}

Your task: Generate 15 personalized questions for this exact profile to determine their actual stage.
- Questions must match their age, position and experience
- Focus on likely stages for this profile (don't ask retirement questions for a 23-year-old)

Return JSON only in this format, no other text:
[
  {"id": 1, "text": "question text", "stage": "role"},
  ...
]

Available stages: choice, adapt, role, effective, esteem, retire`

    const raw = await callGemini(prompt)

    // Strip markdown code fences if present, then extract JSON array
    const cleaned = raw.replace(/```(?:json)?\s*/g, '').replace(/```/g, '')
    const match = cleaned.match(/\[[\s\S]*\]/)
    if (!match) throw new Error('Invalid AI response format')

    const questions = JSON.parse(match[0])
    if (!Array.isArray(questions) || questions.length < 10) throw new Error('Not enough questions generated')

    return NextResponse.json({ questions })
  } catch (err: any) {
    console.error('Questions generation error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
