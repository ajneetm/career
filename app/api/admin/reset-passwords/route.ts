import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

const USERS = [
  { email: 'ghcini@cmc.org.qa',             password: 'GgG@02' },
  { email: 'mbalharith@cmc.org.qa',         password: 'Maryam202666' },
  { email: 'kalrewaili@cmc.org.qa',         password: '230881' },
  { email: 'alusain@cmc.org.qa',            password: 'Hsal@2001' },
  { email: 'arahman@cmc.org.qa',            password: 'Aa@123456' },
  { email: 'malhajaji@cmc.org.qa',          password: 'O@123456' },
  { email: 'malobaidli86@hotmail.com',      password: 'Love4Everm' },
  { email: 'moza-2020@hotmail.com',         password: 'Mm@123456' },
  { email: 'nralmarri@cmc.org.qa',          password: 'Qatar@1234' },
  { email: 'danaalmansoori@gmail.com',      password: 'Doha@123' },
  { email: 'waadenazi2003@gmail.com',       password: 'Waad@1408' },
  { email: 'malsada@cmc.org.qa',            password: 'Ma@33234949' },
  { email: 'salzaabi@cmc.org.qa',           password: 'Saranasser_91' },
  { email: 'faisal0almarri@gmail.com',      password: 'Faisal-0990*' },
  { email: 'nalmuhaizaa@cmc.org.qa',        password: 'Nn#5678900' },
  { email: 'balhashemi07@outlook.com',      password: 'Bb@1234567' },
  { email: 'halmarri2@cmc.rog.qa',          password: 'Hh@123456' },
  { email: 'rowda.i.almansoori@gmail.com',  password: 'Qatar@123' },
  { email: 'mradwani@cmc.org.qa',           password: 'Mohmad999' },
  { email: 'ssaad@cmc.org.qa',              password: 'Ss@123456' },
  { email: 'salwa-almutawah95@hotmail.com', password: 'soso@12345' },
  { email: 'dlebdah@cmc.org.qa',            password: 'Dd@1234567' },
  { email: 'bnoota1902@gmail.com',          password: 'Dd@12341234' },
  { email: 'fatma.25.1@icloud.com',         password: '1Alyafeii' },
  { email: 'mtaha@cmc.org.qa',              password: 'T@123456' },
  { email: 'ahisham@cmc.org.qa',            password: 'Alaa@12345' },
  { email: 'malmaraghi@cmc.org.qa',         password: 'Max@2026' },
  { email: 'aysha_89@hotmail.com',          password: 'aysha@786' },
  { email: 'a.aljilany@outlook.com',        password: 'Aa@123789' },
  { email: 'koody24@gmail.com',             password: 'Kk@123456' },
  { email: 'alaqahtani@cmc.org.qa',         password: 'Aa55647555A' },
  { email: 'salathba@cmc.org.qa',           password: 'Qar@1981000' },
  { email: 'zalraeisi@cmc.org.qa',          password: 'Zeezoo@20266' },
  { email: 'aaaburashid1985@gmail.com',     password: 'Rashid@8585' },
  { email: 'nhassan@cmc.org.qa',            password: 'NM@123456m' },
  { email: 'halghrenaiq@cmc.org.qa',        password: 'Qatar24680@' },
]

export async function POST(req: NextRequest) {
  const { secret } = await req.json()
  if (secret !== process.env.ADMIN_RESET_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // First get all user IDs by email
  const { data: allUsers, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
  if (listErr) return NextResponse.json({ error: listErr.message }, { status: 500 })

  const emailToId: Record<string, string> = {}
  for (const u of allUsers?.users ?? []) {
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
