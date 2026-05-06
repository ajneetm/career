import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

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

const USERS = EMAILS.map(email => ({ email, password: PASSWORD }))

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase())

export async function POST(req: NextRequest) {
  // Verify caller is an admin via their Supabase session
  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? '')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // Fetch all users via RPC (same as main users route)
  const { data: rpcUsers, error: listErr } = await supabaseAdmin.rpc('admin_get_users')
  if (listErr) return NextResponse.json({ error: listErr.message }, { status: 500 })

  const allUsers = { users: (rpcUsers ?? []) as { id: string; email: string }[] }

  const emailToId: Record<string, string> = {}
  for (const u of allUsers.users) {
    if (u.email) emailToId[u.email.toLowerCase()] = u.id
  }

  const results: { email: string; status: string }[] = []

  for (const { email, password } of USERS) {
    const id = emailToId[email.toLowerCase()]
    if (!id) { results.push({ email, status: 'not found' }); continue }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(id, { password })
    results.push({ email, status: error ? `error: ${error.message}` : 'ok' })
  }

  return NextResponse.json({ results })
}
