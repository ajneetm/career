import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { STAGES } from '@/lib/assessment'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

async function callGemini(prompt: string): Promise<string> {
  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 2000, temperature: 0.5, responseMimeType: 'application/json' },
    }),
  })
  const json = await res.json()
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

export async function POST(req: NextRequest) {
  try {
    const {
      firstName, lastName, email, phone,
      age, yearsExperience, position,
      questions, answers,
      language = 'ar',
    } = await req.json()

    if (!age || !yearsExperience || !position || !answers || !questions) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Build Q&A pairs for AI
    const qaPairs = questions.map((q: any, i: number) => {
      const score = answers[i] ?? 3
      const label = language === 'ar'
        ? ['لا أوافق بشدة','لا أوافق','محايد','أوافق','أوافق بشدة'][score - 1]
        : ['Strongly Disagree','Disagree','Neutral','Agree','Strongly Agree'][score - 1]
      return `${i + 1}. ${q.text}\n   الإجابة: ${score}/5 (${label})`
    }).join('\n\n')

    // ── Analysis prompt ───────────────────────────────────────────────────────
    const analysisPrompt = language === 'ar'
      ? `أنت خبير في نموذج أجني للمسار المهني (CAREER) الذي يتكون من 6 مراحل:
1. الاختيار (choice) - سن 15+
2. التأقلم (adapt) - سن 22+
3. الدور (role) - سن 23+
4. الفاعلية (effective) - سن 30+
5. المكانة (esteem) - سن 40+
6. التقاعد (retire) - سن 60+

بيانات المشارك:
- العمر: ${age} سنة
- سنوات الخبرة: ${yearsExperience}
- المنصب: ${position}

إجابات المشارك على الأسئلة المخصصة (مقياس 1-5):
${qaPairs}

مهمتك: حلّل هذه الإجابات وأرجع JSON فقط بهذا الشكل بدون أي نص آخر:
{
  "currentStage": "role",
  "stageReasoning": "جملة واحدة تشرح لماذا هذه المرحلة",
  "scores": {
    "choice": 72,
    "adapt": 85,
    "role": 78,
    "effective": 55,
    "esteem": 40,
    "retire": 25
  },
  "overall": 68,
  "report": {
    "summary": "فقرة افتتاحية تصف الوضع الحالي للشخص بأسلوب إنساني",
    "strengths": "فقرة عن أبرز نقاط القوة بناءً على الإجابات",
    "development": "فقرة عن مناطق التطوير الأكثر إلحاحاً",
    "nextSteps": "فقرة بتوصيات عملية ومحددة للمرحلة القادمة",
    "motivation": "رسالة تحفيزية مخصصة وقصيرة"
  }
}`
      : `You are an expert in the Ajnee Career Pathway Model (CAREER) with 6 stages:
1. Choice (choice) - 15+
2. Adapt (adapt) - 22+
3. Role (role) - 23+
4. Effective (effective) - 30+
5. Esteem (esteem) - 40+
6. Retire (retire) - 60+

Participant data:
- Age: ${age}
- Years of experience: ${yearsExperience}
- Position: ${position}

Answers to personalized questions (scale 1-5):
${qaPairs}

Your task: Analyze these answers and return JSON only in this format, no other text:
{
  "currentStage": "role",
  "stageReasoning": "One sentence explaining why this stage",
  "scores": {
    "choice": 72,
    "adapt": 85,
    "role": 78,
    "effective": 55,
    "esteem": 40,
    "retire": 25
  },
  "overall": 68,
  "report": {
    "summary": "Opening paragraph describing the person's current situation in a human way",
    "strengths": "Paragraph about key strengths based on answers",
    "development": "Paragraph about most urgent development areas",
    "nextSteps": "Paragraph with practical and specific recommendations for the next stage",
    "motivation": "Short personalized motivational message"
  }
}`

    const raw = await callGemini(analysisPrompt)

    // Strip markdown code fences if present, then extract JSON object
    const cleaned = raw.replace(/```(?:json)?\s*/g, '').replace(/```/g, '')
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('Invalid AI response')

    const analysis = JSON.parse(match[0])

    const scores = analysis.scores ?? {}
    const currentStage = analysis.currentStage ?? 'role'

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
        scoreChoice:     scores.choice     ?? 50,
        scoreAdapt:      scores.adapt      ?? 50,
        scoreRole:       scores.role       ?? 50,
        scoreEffective:  scores.effective  ?? 50,
        scoreEsteem:     scores.esteem     ?? 50,
        scoreRetire:     scores.retire     ?? 50,
        overallScore:    analysis.overall  ?? 50,
        currentStage,
        aiAnalysis: JSON.stringify({
          stageReasoning: analysis.stageReasoning,
          report: analysis.report,
        }),
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
