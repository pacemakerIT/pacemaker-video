import VideoDetailContainer from '@/components/features/course/video-detail-container';

interface VideoPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-white">
      <VideoDetailContainer id={id} />
    </div>
  );
}
