import { Suspense } from 'react'
import { CertificateClient } from '@/components/CertificateClient'

export const metadata = { title: 'شهادة إتمام' }

export default function CertificatePage() {
  return <Suspense><CertificateClient /></Suspense>
}
