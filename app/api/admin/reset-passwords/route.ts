import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const PASSWORD = '123456789'

// IDs taken directly from auth.users SQL query
const USERS: { id: string; email: string }[] = [
  { id: '76975421-5303-4e93-b64d-7062827f8088', email: 'ghcini@cmc.org.qa' },
  { id: '21728402-bb49-4fab-9ca6-ace453da7873', email: 'mbalharith@cmc.org.qa' },
  { id: '6f3a83cf-cb04-4264-8520-89c100a07c58', email: 'kalrewaili@cmc.org.qa' },
  { id: '10744f7f-ca7e-42a4-96e5-d9221b1b60f8', email: 'alusain@cmc.org.qa' },
  { id: 'cc02bae9-e8f8-414c-bb78-9be4e7b018d8', email: 'arahman@cmc.org.qa' },
  { id: '46488343-041d-4204-ba31-e067e1c7ef16', email: 'malhajaji@cmc.org.qa' },
  { id: '841ad467-ce32-4efb-96b8-7b5dcabb2c66', email: 'malobaidli86@hotmail.com' },
  { id: '7fa5cb8b-e95c-4082-834e-7618674baff1', email: 'moza-2020@hotmail.com' },
  { id: '5bda319d-b169-43ba-971b-0bdc8be7d7fe', email: 'nralmarri@cmc.org.qa' },
  { id: '52555b3b-1593-4b7e-bc3f-b599899b7537', email: 'danaalmansoori@gmail.com' },
  { id: '650ddfbe-6410-46c1-b218-fb8e8eec9a67', email: 'waadenazi2003@gmail.com' },
  { id: 'f46b2b6a-cf93-4ee4-afd1-3579daa197f1', email: 'malsada@cmc.org.qa' },
  { id: '17ab237c-9fb8-4aad-985d-a5fe9522f8fc', email: 'salzaabi@cmc.org.qa' },
  { id: '449f0cfd-b508-42d3-b598-ae15649ffe1e', email: 'faisal0almarri@gmail.com' },
  { id: 'cf68568b-3692-442f-a94b-59533d913d46', email: 'nalmuhaizaa@cmc.org.qa' },
  { id: 'ab558737-b99a-49e8-a099-129bec57eb10', email: 'balhashemi07@outlook.com' },
  { id: '9017f97f-981a-4412-a56a-6ce20eff617c', email: 'halmarri2@cmc.rog.qa' },
  { id: 'bc3207fa-890a-4a0b-bb94-dbef2a060b91', email: 'rowda.i.almansoori@gmail.com' },
  { id: '30337a3e-cefc-4d2f-bf0a-a0753011a534', email: 'mradwani@cmc.org.qa' },
  { id: '809fee61-c83b-406e-a096-5172ea6e1ea9', email: 'ssaad@cmc.org.qa' },
  { id: '596dcf37-39c4-4cfa-b229-54bad89e05fd', email: 'salwa-almutawah95@hotmail.com' },
  { id: 'a0e1a65b-bd76-4568-8c23-a667d2b51e28', email: 'dlebdah@cmc.org.qa' },
  { id: '899f3863-1fad-446b-a919-4cae9454ac14', email: 'bnoota1902@gmail.com' },
  { id: '01c4c551-8bc4-43a0-a945-4b44fc97c0fe', email: 'fatma.25.1@icloud.com' },
  { id: '362961b9-3304-4ca4-b688-1c1e145d3df1', email: 'mtaha@cmc.org.qa' },
  { id: 'aa85c993-5e7b-47a2-a545-1e72d2209173', email: 'ahisham@cmc.org.qa' },
  { id: '37312cd0-04f1-418f-9e30-3e33dd7d030f', email: 'malmaraghi@cmc.org.qa' },
  { id: '2dec2e38-9463-4ff6-ac68-1edb6356abc8', email: 'aysha_89@hotmail.com' },
  { id: '8b79f91b-7b95-4564-aca8-765b341ae984', email: 'a.aljilany@outlook.com' },
  { id: '78f2ae93-0b23-4fb3-bce4-5dde94d243c6', email: 'koody24@gmail.com' },
  { id: '8da54a42-81ee-43b8-b611-469fdf011edf', email: 'alaqahtani@cmc.org.qa' },
  { id: 'cdba78ac-bc8e-4cac-80e3-b791c0c2ba6e', email: 'salathba@cmc.org.qa' },
  { id: '0ea1c20c-4770-46df-a264-a611976cdb02', email: 'zalraeisi@cmc.org.qa' },
  { id: 'ad8bde0f-a6fd-4f89-92a2-0cbef3aee001', email: 'aaaburashid1985@gmail.com' },
  { id: 'ca0d9e89-7f20-4008-a85c-f36a3c108497', email: 'nhassan@cmc.org.qa' },
  { id: 'dec78466-cbe8-4d56-9e05-1222ec285e40', email: 'halghrenaiq@cmc.org.qa' },
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
  for (const { id, email } of USERS) {
    const { error } = await admin.auth.admin.updateUserById(id, { password: PASSWORD })
    results.push({ email, status: error ? `error: ${error.message}` : 'ok' })
  }

  return NextResponse.json({ results })
}
