import { cache } from 'react';
import { notFound } from 'next/navigation';
import VideoDetailContainer from '@/components/features/course/video-detail-container';
import prisma from '@/lib/prisma';
import { isUuid } from '@/lib/checkout-items';
import type { Metadata } from 'next';

interface VideoPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Shared by generateMetadata and the page so the lookup runs once per request.
// Non-UUID ids would make Prisma throw on the uuid column, so treat them as missing.
const getPublicCourse = cache(async (id: string) => {
  if (!isUuid(id)) return null;

  return prisma.course.findFirst({
    where: { id, isPublic: true },
    select: { title: true, description: true }
  });
});

export async function generateMetadata({
  params
}: VideoPageProps): Promise<Metadata> {
  const { id } = await params;
  const course = await getPublicCourse(id);

  return {
    title: course?.title || 'Career Course',
    description: course?.description || undefined
  };
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { id } = await params;
  const course = await getPublicCourse(id);

  if (!course) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white font-body">
      <VideoDetailContainer id={id} />
    </div>
  );
}
