import { ProjectEvalClient } from '@/components/ProjectEvalClient'
export default function EvaluatePage({ params }: { params: { id: string } }) {
  return <ProjectEvalClient id={params.id} />
}
