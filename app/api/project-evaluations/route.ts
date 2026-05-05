import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const project_id  = searchParams.get('project_id')
  const evaluator_id = searchParams.get('evaluator_id')
  if (!project_id || !evaluator_id) return NextResponse.json({ error: 'missing params' }, { status: 400 })

  const { data } = await supabaseAdmin
    .from('project_evaluations')
    .select('id')
    .eq('project_id', project_id)
    .eq('evaluator_id', evaluator_id)
    .maybeSingle()

  return NextResponse.json({ evaluated: !!data })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { error } = await supabaseAdmin.from('project_evaluations').insert(body)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
