import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const owner_id = searchParams.get('owner_id')
  if (!owner_id) return NextResponse.json({ error: 'owner_id required' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('owner_id', owner_id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const { owner_id, owner_name, title, description } = await req.json()
  if (!owner_id || !title) return NextResponse.json({ error: 'missing fields' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('projects')
    .insert({ owner_id, owner_name, title, description })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id })
}
