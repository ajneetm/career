import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateScores, determineCurrentStage, STAGES, POSITIONS_AR } from '@/lib/assessment'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${GEMINI_API_KEY}`

async function callGemini(prompt: string): Promise<string> {
  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 1200 } }),
  })
  const json = await res.json()
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, phone, age, yearsExperience, position, answers, language = 'ar' } = body

    if (!age || !yearsExperience || !position || !answers || answers.length < 21) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { stageScores, overall } = calculateScores(answers)
    const currentStage = determineCurrentStage(age, yearsExperience, position)

    // Build AI prompt
    const stageList = STAGES.map(s => `${s.labelAr} (${s.labelEn}): ${stageScores[s.key]}%`).join('\n')
    const currentStageName = STAGES.find(s => s.key === currentStage)

    const prompt = language === 'ar'
      ? `أنت مستشار مسار مهني متخصص في نموذج أجني للمسار المهني (CAREER).

بيانات المشارك:
- العمر: ${age} سنة
- سنوات الخبرة: ${yearsExperience}
- المنصب الحالي: ${position}
- المرحلة الحالية: ${currentStageName?.labelAr} (${currentStageName?.age})

نتائج التقييم (6 محاور):
${stageList}

المعدل العام: ${overall}%

اكتب تقريراً تحليلياً موجزاً (4-5 فقرات) باللغة العربية الفصحى يتضمن:
1. تحليل الوضع الحالي وتحديد المرحلة التي يعيشها
2. أبرز نقاط القوة بناءً على أعلى نتائج المحاور
3. مناطق التطوير الأكثر إلحاحاً
4. توصيات عملية ومحددة للمرحلة القادمة
5. رسالة تحفيزية مخصصة

أرجع النص فقط بدون أي علامات markdown.`
      : `You are a career advisor specialized in the Ajnee Career Pathway Model (CAREER).

Participant data:
- Age: ${age} years
- Years of experience: ${yearsExperience}
- Current position: ${position}
- Current stage: ${currentStageName?.labelEn} (${currentStageName?.age})

Assessment results (6 axes):
${stageList}

Overall score: ${overall}%

Write a concise analytical report (4-5 paragraphs) in English including:
1. Current situation analysis and stage identification
2. Key strengths based on highest axis scores
3. Most urgent development areas
4. Practical and specific recommendations for the next stage
5. A personalized motivational message

Return plain text only, no markdown.`

    let aiAnalysis = ''
    try {
      aiAnalysis = await callGemini(prompt)
    } catch (e) {
      console.error('Gemini error:', e)
    }

    const assessment = await prisma.assessment.create({
      data: {
        firstName:       firstName || null,
        lastName:        lastName  || null,
        email:           email     || null,
        phone:           phone     || null,
        age:             parseInt(age),
        yearsExperience: parseInt(yearsExperience),
        position,
        answers,
        scoreChoice:     stageScores.choice,
        scoreAdapt:      stageScores.adapt,
        scoreRole:       stageScores.role,
        scoreEffective:  stageScores.effective,
        scoreEsteem:     stageScores.esteem,
        scoreRetire:     stageScores.retire,
        overallScore:    overall,
        currentStage,
        aiAnalysis,
        language,
      },
    })

    return NextResponse.json({ id: assessment.id })
  } catch (err: any) {
    console.error('Assessment error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const assessment = await prisma.assessment.findUnique({ where: { id } })
  if (!assessment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(assessment)
}
