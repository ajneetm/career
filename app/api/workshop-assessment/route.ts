import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const workshop_id = searchParams.get('workshop_id')
  const user_id     = searchParams.get('user_id')
  if (!workshop_id || !user_id) return NextResponse.json({ error: 'missing params' }, { status: 400 })

  const [{ data: ws }, { data: pre }, { data: post }] = await Promise.all([
    supabaseAdmin.from('workshops').select('post_assessment_open').eq('id', workshop_id).single(),
    supabaseAdmin.from('workshop_pre_assessments').select('total_score, axis1, axis2, axis3').eq('workshop_id', workshop_id).eq('user_id', user_id).maybeSingle(),
    supabaseAdmin.from('workshop_post_assessments').select('total_score, axis1, axis2, axis3').eq('workshop_id', workshop_id).eq('user_id', user_id).maybeSingle(),
  ])

  return NextResponse.json({
    pre_done:   !!pre,
    post_done:  !!post,
    post_open:  ws?.post_assessment_open ?? false,
    pre_score:  pre?.total_score  ?? null,
    post_score: post?.total_score ?? null,
    pre_axes:   pre  ? [pre.axis1,  pre.axis2,  pre.axis3]  : null,
    post_axes:  post ? [post.axis1, post.axis2, post.axis3] : null,
  })
}

export async function POST(req: NextRequest) {
  const { type, workshop_id, user_id, user_email, answers, total_score, axes } = await req.json()
  if (!type || !workshop_id || !user_id || !answers) return NextResponse.json({ error: 'missing fields' }, { status: 400 })

  const table = type === 'pre' ? 'workshop_pre_assessments' : 'workshop_post_assessments'

  // prevent double submission
  const { data: existing } = await supabaseAdmin.from(table).select('id').eq('workshop_id', workshop_id).eq('user_id', user_id).maybeSingle()
  if (existing) return NextResponse.json({ error: 'already_submitted' }, { status: 409 })

  // for post: verify post_assessment_open
  if (type === 'post') {
    const { data: ws } = await supabaseAdmin.from('workshops').select('post_assessment_open').eq('id', workshop_id).single()
    if (!ws?.post_assessment_open) return NextResponse.json({ error: 'post_assessment_closed' }, { status: 403 })
  }

  const { error } = await supabaseAdmin.from(table).insert({
    workshop_id, user_id, user_email,
    answers, total_score,
    axis1: axes[0], axis2: axes[1], axis3: axes[2],
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
