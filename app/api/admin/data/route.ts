import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const [
    { data: surveys },
    { data: workshops },
    { data: materials },
    { data: enrollments },
    { data: consultations },
    { data: evalSettings },
    { data: wsEvals },
    { data: projects },
    { data: projectEvals },
    { data: wsRegistrations },
  ] = await Promise.all([
    supabaseAdmin.from('survey_results').select('*').order('created_at', { ascending: false }),
    supabaseAdmin.from('workshops').select('*').order('created_at'),
    supabaseAdmin.from('workshop_materials').select('*').order('sort_order'),
    supabaseAdmin.from('workshop_enrollments').select('*').order('created_at', { ascending: false }),
    supabaseAdmin.from('consultations').select('*').order('created_at', { ascending: false }),
    supabaseAdmin.from('evaluation_settings').select('*').eq('id', 1).single(),
    supabaseAdmin.from('workshop_evaluations').select('*').order('created_at', { ascending: false }),
    supabaseAdmin.from('projects').select('*').order('created_at', { ascending: false }),
    supabaseAdmin.from('project_evaluations').select('*').order('created_at', { ascending: false }),
    supabaseAdmin.from('workshop_registrations').select('*').order('created_at', { ascending: false }),
  ])

  return NextResponse.json({
    surveys: surveys ?? [],
    workshops: workshops ?? [],
    materials: materials ?? [],
    enrollments: enrollments ?? [],
    consultations: consultations ?? [],
    evalSettings: evalSettings ?? { is_open: false },
    wsEvals: wsEvals ?? [],
    projects: projects ?? [],
    projectEvals: projectEvals ?? [],
    wsRegistrations: wsRegistrations ?? [],
  })
}
