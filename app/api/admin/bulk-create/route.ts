import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const PASSWORD = '123456789'

const EMAILS = [
  'ghcini@cmc.org.qa',
  'mbalharith@cmc.org.qa',
  'kalrewaili@cmc.org.qa',
  'alusain@cmc.org.qa',
  'arahman@cmc.org.qa',
  'malhajaji@cmc.org.qa',
  'malobaidli86@hotmail.com',
  'moza-2020@hotmail.com',
  'nralmarri@cmc.org.qa',
  'danaalmansoori@gmail.com',
  'waadenazi2003@gmail.com',
  'malsada@cmc.org.qa',
  'salzaabi@cmc.org.qa',
  'faisal0almarri@gmail.com',
  'nalmuhaizaa@cmc.org.qa',
  'balhashemi07@outlook.com',
  'halmarri2@cmc.rog.qa',
  'rowda.i.almansoori@gmail.com',
  'mradwani@cmc.org.qa',
  'ssaad@cmc.org.qa',
  'salwa-almutawah95@hotmail.com',
  'dlebdah@cmc.org.qa',
  'bnoota1902@gmail.com',
  'fatma.25.1@icloud.com',
  'mtaha@cmc.org.qa',
  'ahisham@cmc.org.qa',
  'malmaraghi@cmc.org.qa',
  'aysha_89@hotmail.com',
  'a.aljilany@outlook.com',
  'koody24@gmail.com',
  'alaqahtani@cmc.org.qa',
  'salathba@cmc.org.qa',
  'zalraeisi@cmc.org.qa',
  'aaaburashid1985@gmail.com',
  'nhassan@cmc.org.qa',
  'halghrenaiq@cmc.org.qa',
]

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase())

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: { user } } = await admin.auth.getUser(token)
  if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? '')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const results: { email: string; status: string }[] = []

  for (const email of EMAILS) {
    const { error } = await admin.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
    })
    if (error?.message?.includes('already registered') || error?.message?.includes('already been registered')) {
      results.push({ email, status: 'exists' })
    } else if (error) {
      results.push({ email, status: `error: ${error.message}` })
    } else {
      results.push({ email, status: 'created' })
    }
  }

  return NextResponse.json({ results })
}
