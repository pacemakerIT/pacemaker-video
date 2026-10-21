import VideoDetailContainer from '@/components/features/course/video-detail-container';
import prisma from '@/lib/prisma';
import type { Metadata } from 'next';

interface VideoPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params
}: VideoPageProps): Promise<Metadata> {
  const { id } = await params;
  const course = await prisma.course.findFirst({
    where: { id, isPublic: true },
    select: { title: true, description: true }
  });

  return {
    title: course?.title || 'Career Course',
    description: course?.description || undefined
  };
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-white font-body">
      <VideoDetailContainer id={id} />
    </div>
  );
}
