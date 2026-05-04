import type { Metadata } from 'next'
import { InterestsClient } from '@/components/InterestsClient'

export const metadata: Metadata = {
  title: 'اكتشف ميولك المهنية | RIASEC',
}

export default function InterestsPage() {
  return <InterestsClient />
}
