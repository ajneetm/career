import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const { data, error } = await supabaseAdmin
    .from('strange_professions')
    .select('id, name, code')
    .eq('code', code)
    .eq('is_active', true)
    .single()

  if (error || !data) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json(data)
}
