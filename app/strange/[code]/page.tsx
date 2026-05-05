import { StrangeProfessionClient } from '@/components/StrangeProfessionClient'
export default function StrangePage({ params }: { params: { code: string } }) {
  return <StrangeProfessionClient code={params.code} />
}
