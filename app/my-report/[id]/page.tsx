import { MyReportDetailClient } from '@/components/MyReportDetailClient'

export default async function MyReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <MyReportDetailClient id={id} />
}
