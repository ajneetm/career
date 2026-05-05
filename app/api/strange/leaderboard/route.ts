import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const profession_id = searchParams.get('profession_id')
  const workshop_id   = searchParams.get('workshop_id')

  let wsId = workshop_id

  // if given profession_id, find its workshop
  if (!wsId && profession_id) {
    const { data: prof } = await supabaseAdmin
      .from('strange_professions')
      .select('workshop_id')
      .eq('id', profession_id)
      .single()
    wsId = prof?.workshop_id ?? null
  }

  let query = supabaseAdmin
    .from('strange_professions')
    .select('id, name, code, workshop_id, strange_profession_votes(avg_score)')
    .eq('is_active', true)
    .order('name')

  if (wsId) query = query.eq('workshop_id', wsId) as typeof query

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const ranked = (data ?? [])
    .map(p => {
      const votes = p.strange_profession_votes as { avg_score: number }[]
      const avg = votes.length ? votes.reduce((s, v) => s + v.avg_score, 0) / votes.length : 0
      return { id: p.id, name: p.name, code: p.code, votes: votes.length, avg: +avg.toFixed(2) }
    })
    .sort((a, b) => b.avg - a.avg || b.votes - a.votes)

  return NextResponse.json(ranked)
}
