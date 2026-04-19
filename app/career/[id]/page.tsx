import { CareerStageClient } from '@/components/CareerStageClient';
import { careerStageIds } from '@/lib/career-stages';

export async function generateStaticParams() {
  return careerStageIds.map((id) => ({ id }));
}

interface CareerProps {
  params: Promise<{ id: string }>;
}

export default async function CareerDetail({ params }: CareerProps) {
  const { id } = await params;
  return <CareerStageClient stageId={id ?? ''} />;
}
