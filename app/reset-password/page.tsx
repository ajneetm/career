import { Suspense } from 'react'
import { ResetPasswordClient } from '@/components/ResetPasswordClient'

export const metadata = { title: 'إعادة تعيين كلمة المرور' }

export default function ResetPasswordPage() {
  return <Suspense><ResetPasswordClient /></Suspense>
}
