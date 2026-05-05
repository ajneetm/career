import { MyReportDetailClient } from '@/components/MyReportDetailClient'
export default function MyReportPage({ params }: { params: { id: string } }) {
  return <MyReportDetailClient id={params.id} />
}
