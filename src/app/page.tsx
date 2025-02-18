import { WistiaPlayer } from '@wistia/wistia-player-react';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';

export default async function Home() {
  const { userId } = await auth();

  const videos = [{ id: '4e8wv1z7tl', title: 'video 1' }];

  if (!userId) {
    return (
      <div className="flex h-[calc(100vh-5rem)] items-center justify-center p-4">
        <div className="w-full max-w-4xl mx-auto">
          Please sign in to access this content.
        </div>
      </div>
    );
  }

  function goToVideoDetails(mediaId: string): string {
    return `/${mediaId}`;
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        {videos.map((video) => (
          <div key={video.id} className="p-4 border rounded-lg shadow">
            <WistiaPlayer mediaId={video.id} />
            <h2 className="mt-2">{video.title}</h2>
            <Link
              href={goToVideoDetails(video.id)}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded inline-block"
            >
              상세보기
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
