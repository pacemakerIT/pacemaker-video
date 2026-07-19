import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import WorkshopDetail from '@/components/features/workshops/workshop-detail';

export default async function WorkshopDetailPage({
  params
}: {
  params: Promise<{ workshopId: string }>;
}) {
  const { workshopId } = await params;
  const workshop = await prisma.workshop.findUnique({
    where: { id: workshopId },
    include: {
      sectionsRel: { orderBy: { orderIndex: 'asc' } },
      instructors: { include: { instructor: true } }
    }
  });

  if (!workshop || workshop.status === 'HIDDEN') notFound();

  const suggested = await prisma.workshop.findMany({
    where: { id: { not: workshop.id }, status: { not: 'HIDDEN' } },
    orderBy: { startDate: 'asc' },
    take: 3
  });

  return (
    <WorkshopDetail
      workshop={{
        ...workshop,
        startDate: workshop.startDate.toISOString(),
        endDate: workshop.endDate.toISOString(),
        sections: workshop.sectionsRel,
        instructors: workshop.instructors.map(({ instructor }) => instructor)
      }}
      suggested={suggested.map((item) => ({
        ...item,
        startDate: item.startDate.toISOString()
      }))}
    />
  );
}
