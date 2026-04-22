import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { AssessmentResultClient } from '@/components/AssessmentResultClient'

export default async function AssessmentResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const assessment = await prisma.assessment.findUnique({ where: { id } })
  if (!assessment) notFound()

  return <AssessmentResultClient assessment={assessment as any} />
}
