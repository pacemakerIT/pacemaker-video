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
      instructors: { include: { instructor: true } },
      _count: { select: { userWorkshops: true } }
    }
  });

  if (!workshop || workshop.status === 'HIDDEN') notFound();

  const suggested = await prisma.workshop.findMany({
    where: { id: { not: workshop.id }, status: { not: 'HIDDEN' } },
    orderBy: { startDate: 'asc' },
    take: 3,
    include: {
      instructors: {
        include: {
          instructor: { select: { name: true } }
        }
      }
    }
  });

  return (
    <WorkshopDetail
      workshop={{
        ...workshop,
        startDate: workshop.startDate.toISOString(),
        endDate: workshop.endDate.toISOString(),
        registrationCount: workshop._count.userWorkshops,
        sections: workshop.sectionsRel,
        instructors: workshop.instructors.map(({ instructor }) => instructor)
      }}
      suggested={suggested.map((item) => ({
        ...item,
        startDate: item.startDate.toISOString(),
        endDate: item.endDate.toISOString(),
        instructors: item.instructors.map(({ instructor }) => instructor)
      }))}
    />
  );
}
