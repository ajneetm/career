import { NextRequest, NextResponse } from 'next/server'

const MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash']

async function callGemini(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY is not set')

  let lastError = ''
  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1500, temperature: 0.5, responseMimeType: 'application/json' },
      }),
    })
    const json = await res.json()
    if (json.error) { lastError = json.error.message; continue }
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    if (text) return text
  }
  throw new Error(`Gemini error: ${lastError}`)
}

export async function POST(req: NextRequest) {
  try {
    const { stageId: _stageId, stageTitle, axisScores, total } = await req.json()

    const scoresText = axisScores
      .map((a: { title: string; score: number }) => `- ${a.title}: ${a.score}/20`)
      .join('\n')

    const prompt = `أنت مرشد مهني خبير. قام شخص بإجراء استبيان تشخيصي لـ"${stageTitle}".

نتائج الاستبيان:
${scoresText}
الدرجة الكلية: ${total}/120

تفسير الدرجات لكل محور: 16-20 = قوة واضحة، 11-15 = جيد يحتاج دعم، 6-10 = فجوة تحتاج تدخل، 4-5 = ضعف حرج.
تفسير الدرجة الكلية: 96-120 = جاهزية عالية، 72-95 = متوسطة، 48-71 = ناقصة، أقل من 48 = تحتاج بناء أساس.

أرجع JSON فقط بهذا الشكل:
{
  "strengths": ["جملة قصيرة لكل محور حصل على 16 أو أكثر"],
  "weaknesses": ["جملة قصيرة لكل محور حصل على أقل من 16"],
  "recommendation": "فقرة واحدة مخصصة وإنسانية تعكس الصورة الكاملة للشخص في هذه المرحلة وتحفزه على المضي قدماً"
}`

    const raw = await callGemini(prompt)
    const cleaned = raw.replace(/```(?:json)?\s*/g, '').replace(/```/g, '')
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('Invalid AI response')

    const report = JSON.parse(match[0])
    return NextResponse.json({ report })
  } catch (err: any) {
    console.error('Stage assessment AI error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
