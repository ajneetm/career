import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const { data } = await supabaseAdmin
    .from('evaluation_settings').select('is_open').eq('id', 1).single()
  return NextResponse.json({ is_open: data?.is_open ?? false })
}
