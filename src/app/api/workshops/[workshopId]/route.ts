import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { WorkshopStatus, WorkshopCategory } from '@prisma/client';

const RECRUIT_STATUS_MAP: Record<string, string> = {
  모집중: 'OPEN',
  모집완료: 'CLOSED',
  진행완료: 'COMPLETED'
};

const toWorkshopStatus = (status: string): WorkshopStatus =>
  status as unknown as WorkshopStatus;

interface InstructorInput {
  name: string;
  intro: string;
  photoUrl: string;
  careers?: {
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    description: string;
  }[];
}

interface SectionInput {
  title: string;
  content: string;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ workshopId: string }> }
) {
  const { workshopId } = await params;

  try {
    const body = await request.json();
    const {
      category,
      recruitStatus,
      showOnMain,
      title,
      description,
      startDate,
      endDate,
      location,
      processContent,
      price,
      thumbnailUrl,
      sections,
      instructors
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      // 기존 강사 연결 및 섹션 삭제
      await tx.workshopInstructor.deleteMany({ where: { workshopId } });
      await tx.section.deleteMany({ where: { workshopId } });

      const workshop = await tx.workshop.update({
        where: { id: workshopId },
        data: {
          category: (category as WorkshopCategory) || null,
          status: toWorkshopStatus(RECRUIT_STATUS_MAP[recruitStatus] ?? 'OPEN'),
          isMain: showOnMain ?? false,
          title,
          description,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          locationOrUrl: location || null,
          processContent: processContent || null,
          price: price != null ? parseFloat(price) : null,
          thumbnail: thumbnailUrl || null
        }
      });

      // 강사 재생성
      for (const inst of instructors || []) {
        const instructorData = inst as InstructorInput;
        const newInstructor = await tx.instructor.create({
          data: {
            name: instructorData.name,
            description: instructorData.intro,
            profileImage: instructorData.photoUrl || null,
            careers: instructorData.careers || []
          }
        });
        await tx.workshopInstructor.create({
          data: {
            workshopId: workshop.id,
            instructorId: newInstructor.id
          }
        });
      }

      // 섹션 재생성
      for (let i = 0; i < (sections || []).length; i++) {
        const s: SectionInput = sections[i];
        await tx.section.create({
          data: {
            title: s.title,
            description: s.content,
            orderIndex: i,
            workshopId: workshop.id
          }
        });
      }

      return workshop;
    });

    return NextResponse.json({
      message: 'Workshop updated successfully',
      workshop: updated
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`[API ERROR] PUT /api/workshops/${workshopId}:`, error);
    return NextResponse.json(
      { error: `Failed to update workshop: ${error}` },
      { status: 500 }
    );
  }
}
