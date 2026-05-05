import { StrangeProfessionClient } from '@/components/StrangeProfessionClient'
export default async function StrangePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  return <StrangeProfessionClient code={code} />
}
