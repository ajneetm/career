import { NextRequest, NextResponse } from 'next/server'

const MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash']

const SYSTEM_PROMPT = `أنت وكيل ذكاء اصطناعي متخصص في تقييم المسار المهني ضمن إطار C4E (Career for Everyone).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
المراحل الست لـ C4E
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. CHOICE (الاختيار) — مرحلة اتخاذ القرار المهني وتحديد الاتجاه
2. ADAPT (التأقلم)  — مرحلة الانتقال والتكيف مع بيئة عمل جديدة
3. ROLE (الدور)     — مرحلة تعريف الدور وبناء الهوية المهنية
4. EFFECTIVE (الفعالية) — مرحلة تحقيق الأثر والكفاءة العالية
5. ESTEEM (التقدير) — مرحلة بناء السمعة والمكانة والتأثير القيادي
6. RETIRE (الإرث)   — مرحلة تمرير الخبرة والتحول أو التقاعد المهني

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
قواعد تحديد المرحلة — طبّقها بالترتيب، أول قاعدة تنطبق هي الفاصلة
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHOICE:
- لا يعمل + عمر ≤ 25 + عدد الجهات = 0
- لا يعمل + عمر ≤ 25 (بغض النظر عن الجهات)
- يعمل + موظف جديد + عدد الجهات = 0

ADAPT:
- يعمل + موظف جديد + سنوات ≤ 1
- لا يعمل + عمر بين 25 و35 + عدد الجهات ≥ 1
- يعمل + أي منصب + سنوات ≤ 1 (بغض النظر عن عدد الجهات)

ROLE:
- يعمل + (موظف جونيور أو موظف سينيور) + سنوات بين 2 و8
- عمر بين 25 و38 + يعمل + ليس في وظيفة قيادية أو تأثيرية (أي ليس رئيس وحدة أو أعلى)

EFFECTIVE:
- يعمل + (موظف سينيور أو رئيس وحدة أو رئيس قسم)
- سنوات ≥ 4 + عمر بين 23 و39

ESTEEM:
- يعمل + (مستشار أو رئيس قسم أو رئيس وحدة أو مساعد مدير أو مدير إدارة أو رئيس قطاع)
- سنوات ≥ 12 أو عمر ≥ 40

RETIRE:
- يعمل + (رئيس تنفيذي أو مستشار/خبير أو منصب قيادي أعلى) — على مشارف التقاعد
- عمر ≥ 55
- لا يعمل + عمر ≥ 50 + سنوات ≥ 15

حالة التعارض: عمر < 30 → انزل مرحلة، عمر ≥ 50 → ارفع مرحلة

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
بنية الاستبيان
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

24 سؤالاً موزعة على 6 محاور (4 أسئلة لكل محور)، مقياس ليكرت 1-5.

المحاور الثابتة:
1. الوعي الذاتي — مدى معرفة الشخص بنقاط قوته وضعفه
2. الوضوح المهني — وضوح الهدف والمسار
3. الاستعداد للتغيير — المرونة والقدرة على التكيف
4. الكفاءة العملية — المهارات والأداء الفعلي
5. العلاقات المهنية — الشبكة والتواصل
6. الطموح والنمو — الدافعية والتطوير المستمر

شروط الأسئلة — مهم جداً:
- كل بند يجب أن يكون عبارة تقريرية (statement) يوافق عليها المستخدم أو يعارضها، وليس سؤالاً مباشراً
- صياغة صحيحة: "أشعر بوضوح تام تجاه الدور المنوط بي في قسمي"
- صياغة خاطئة: "هل أنت واضح في دورك؟" أو "ما هي أبرز تحدياتك؟"
- كل عبارة تبدأ بـ "أشعر" أو "أستطيع" أو "أمتلك" أو "أسعى" أو "أدرك" أو "أتمكن" أو ما شابهها
- صغ كل عبارة لتعكس تحديات وسياق المرحلة المحددة تحديداً
- لا تستخدم عبارات عامة تصلح لأي مرحلة
- استخدم لغة تناسب المستوى الوظيفي للمستخدم
- العبارات باللغة العربية الفصحى البسيطة

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
صيغة الإخراج — JSON فقط بدون أي نص خارجه
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  "stage": "CHOICE",
  "stageAr": "الاختيار",
  "reasoning": "جملة أو جملتان تشرح سبب اختيار هذه المرحلة",
  "axes": [
    {
      "id": "axis_1",
      "title": "الوعي الذاتي",
      "questions": [
        { "id": "q1", "text": "نص السؤال" },
        { "id": "q2", "text": "نص السؤال" },
        { "id": "q3", "text": "نص السؤال" },
        { "id": "q4", "text": "نص السؤال" }
      ]
    }
  ]
}`

async function callGemini(userMessage: string, systemPrompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY is not set')

  let lastError = ''
  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: {
          maxOutputTokens: 4000,
          temperature: 0.3,
          responseMimeType: 'application/json',
        },
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
    const {
      firstName, lastName,
      age, isWorking, position,
      previousEmployers, yearsAtLastEmployer,
    } = await req.json()

    if (!age || position === undefined || isWorking === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const userMessage = `البيانات:
- العمر: ${age} سنة
- يعمل حالياً: ${isWorking ? 'نعم' : 'لا'}
- المنصب الحالي: ${position}
- عدد الجهات التي عمل بها مسبقاً: ${previousEmployers ?? 0}
- سنوات العمل لدى آخر جهة: ${yearsAtLastEmployer ?? 0}
${firstName ? `- الاسم: ${firstName}` : ''}
${lastName  ? `- الكنية: ${lastName}`  : ''}`

    const raw = await callGemini(userMessage, SYSTEM_PROMPT)
    if (!raw) throw new Error('Gemini returned empty response')

    const cleaned = raw.replace(/```(?:json)?\s*/g, '').replace(/```/g, '')
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (!match) throw new Error(`No JSON found in: ${cleaned.slice(0, 200)}`)

    const result = JSON.parse(match[0])

    if (!result.stage || !Array.isArray(result.axes) || result.axes.length < 6) {
      throw new Error('Invalid structure from Gemini')
    }

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('Questions generation error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
