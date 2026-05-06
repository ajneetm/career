import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const PASSWORD = '123456789'

const EMAILS = [
  'ghcini@cmc.org.qa', 'mbalharith@cmc.org.qa', 'kalrewaili@cmc.org.qa',
  'alusain@cmc.org.qa', 'arahman@cmc.org.qa', 'malhajaji@cmc.org.qa',
  'malobaidli86@hotmail.com', 'moza-2020@hotmail.com', 'nralmarri@cmc.org.qa',
  'danaalmansoori@gmail.com', 'waadenazi2003@gmail.com', 'malsada@cmc.org.qa',
  'salzaabi@cmc.org.qa', 'faisal0almarri@gmail.com', 'nalmuhaizaa@cmc.org.qa',
  'balhashemi07@outlook.com', 'halmarri2@cmc.rog.qa', 'rowda.i.almansoori@gmail.com',
  'mradwani@cmc.org.qa', 'ssaad@cmc.org.qa', 'salwa-almutawah95@hotmail.com',
  'dlebdah@cmc.org.qa', 'bnoota1902@gmail.com', 'fatma.25.1@icloud.com',
  'mtaha@cmc.org.qa', 'ahisham@cmc.org.qa', 'malmaraghi@cmc.org.qa',
  'aysha_89@hotmail.com', 'a.aljilany@outlook.com', 'koody24@gmail.com',
  'alaqahtani@cmc.org.qa', 'salathba@cmc.org.qa', 'zalraeisi@cmc.org.qa',
  'aaaburashid1985@gmail.com', 'nhassan@cmc.org.qa', 'halghrenaiq@cmc.org.qa',
]

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase())

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const admin = createClient(url, serviceKey)

  const { data: { user } } = await admin.auth.getUser(token)
  if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? '')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // Get user IDs from auth schema directly
  const authClient = createClient(url, serviceKey, { db: { schema: 'auth' } })
  const { data: dbUsers, error: dbErr } = await authClient
    .from('users')
    .select('id, email')
    .in('email', EMAILS)

  if (dbErr) {
    // Fallback: use Auth Admin API pagination
    const results: { email: string; status: string }[] = []
    let page = 1
    const emailToId: Record<string, string> = {}

    while (true) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 })
      if (error || !data?.users?.length) break
      for (const u of data.users) {
        if (u.email) emailToId[u.email.toLowerCase()] = u.id
      }
      if (data.users.length < 1000) break
      page++
    }

    for (const email of EMAILS) {
      const id = emailToId[email.toLowerCase()]
      if (!id) { results.push({ email, status: 'not found' }); continue }
      const { error } = await admin.auth.admin.updateUserById(id, { password: PASSWORD })
      results.push({ email, status: error ? `error: ${error.message}` : 'ok' })
    }
    return NextResponse.json({ results })
  }

  const emailToId: Record<string, string> = {}
  for (const u of dbUsers ?? []) {
    if (u.email) emailToId[(u.email as string).toLowerCase()] = u.id as string
  }

  const results: { email: string; status: string }[] = []
  for (const email of EMAILS) {
    const id = emailToId[email.toLowerCase()]
    if (!id) { results.push({ email, status: 'not found' }); continue }
    const { error } = await admin.auth.admin.updateUserById(id, { password: PASSWORD })
    results.push({ email, status: error ? `error: ${error.message}` : 'ok' })
  }

  return NextResponse.json({ results })
}
