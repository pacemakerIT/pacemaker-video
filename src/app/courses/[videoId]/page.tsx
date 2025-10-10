import VideoDetailContainer from '@/components/features/course/video-detail-container';

interface VideoPageProps {
  params: Promise<{
    videoId: string;
  }>;
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { videoId } = await params;

  return (
    <div className="min-h-screen bg-white">
      <VideoDetailContainer videoId={videoId} />
    </div>
  );
}
