import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import WorkshopEditClient from './edit-client';

async function getWorkshopForEdit(id: string) {
  const workshop = await prisma.workshop.findUnique({
    where: { id },
    include: {
      instructors: {
        include: {
          instructor: true
        }
      },
      sectionsRel: {
        orderBy: { orderIndex: 'asc' }
      }
    }
  });
  return workshop;
}

const STATUS_TO_RECRUIT: Record<string, string> = {
  OPEN: '모집중',
  CLOSED: '모집완료',
  COMPLETED: '진행완료',
  HIDDEN: '모집중'
};

export default async function WorkshopEditPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workshop = await getWorkshopForEdit(id);

  if (!workshop) {
    notFound();
  }

  const startDateObj = new Date(workshop.startDate);
  const endDateObj = new Date(workshop.endDate);

  const pad = (n: number) => String(n).padStart(2, '0');
  const startDateStr = `${startDateObj.getFullYear()}-${pad(startDateObj.getMonth() + 1)}-${pad(startDateObj.getDate())}`;
  const startTimeStr = `${pad(startDateObj.getHours())}:${pad(startDateObj.getMinutes())}`;
  const endDateStr = `${endDateObj.getFullYear()}-${pad(endDateObj.getMonth() + 1)}-${pad(endDateObj.getDate())}`;
  const endTimeStr = `${pad(endDateObj.getHours())}:${pad(endDateObj.getMinutes())}`;

  const initialData = {
    category: workshop.category ?? '',
    recruitStatus: STATUS_TO_RECRUIT[workshop.status] ?? '모집중',
    showOnMain: workshop.isMain,
    title: workshop.title,
    intro: workshop.description ?? '',
    startDate: startDateStr,
    startTime: startTimeStr,
    endDate: endDateStr,
    endTime: endTimeStr,
    location: workshop.locationOrUrl ?? '',
    processContent: workshop.processContent ?? '',
    price: workshop.price != null ? String(workshop.price) : '',
    thumbnail: null,
    thumbnailUrl: workshop.thumbnail ?? '',
    sections:
      workshop.sectionsRel.length > 0
        ? workshop.sectionsRel.map((s) => ({
            title: s.title,
            content: s.description ?? '',
            videos: []
          }))
        : [{ title: '', content: '', videos: [{ title: '', link: '' }] }],
    instructors:
      workshop.instructors.length > 0
        ? workshop.instructors.map((wi) => ({
            name: wi.instructor.name,
            intro: wi.instructor.description ?? '',
            careers: Array.isArray(wi.instructor.careers)
              ? (
                  wi.instructor.careers as {
                    startDate?: string;
                    endDate?: string;
                    isCurrent?: boolean;
                    description?: string;
                  }[]
                ).map((c) => ({
                  startDate: c.startDate ?? '',
                  endDate: c.endDate ?? '',
                  isCurrent: c.isCurrent ?? false,
                  description: c.description ?? ''
                }))
              : [
                  {
                    startDate: '',
                    endDate: '',
                    isCurrent: false,
                    description: ''
                  }
                ],
            photo: null,
            photoUrl: wi.instructor.profileImage ?? ''
          }))
        : [
            {
              name: '',
              intro: '',
              careers: [
                {
                  startDate: '',
                  endDate: '',
                  isCurrent: false,
                  description: ''
                }
              ],
              photo: null,
              photoUrl: ''
            }
          ]
  };

  return <WorkshopEditClient workshopId={id} initialData={initialData} />;
}
