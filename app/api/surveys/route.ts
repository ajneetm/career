import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// POST — حفظ نتيجة اختبار (service role يتجاوز RLS)
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { user_id, email, name, survey_type, total_score, modal_scores, language } = body

  if (!survey_type) return NextResponse.json({ error: 'survey_type required' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('survey_results')
    .insert({ user_id: user_id ?? null, email, name, survey_type, total_score, modal_scores, language })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ id: data.id })
}

// GET — جلب نتائج مستخدم (admin فقط)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const user_id = searchParams.get('user_id')

  const query = supabaseAdmin.from('survey_results').select('*').order('created_at', { ascending: false })
  if (user_id) query.eq('user_id', user_id)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
