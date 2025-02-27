import { auth } from '@clerk/nextjs/server';
import { WistiaPlayer } from '@wistia/wistia-player-react';
import Link from 'next/link';

export default async function VideoDetails({
  params
}: {
  params: Promise<{ videoId: string }>;
}) {
  const { userId } = await auth();
  const videoId = (await params).videoId;
  const purchased = false;

  function goToPurchase(videoId: string): string {
    if (!userId) {
      return `/sign-in?redirect_url=/${videoId}`;
    } else {
      return `/purchase/${videoId}`;
    }
  }

  return (
    <div className="flex h-screen items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto relative">
        <div className={!purchased ? 'pointer-events-none opacity-50' : ''}>
          <WistiaPlayer mediaId={videoId} />
        </div>

        {!purchased && (
          <>
            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center space-y-4 z-10">
              <p className="text-white text-lg">구매 후 시청할 수 있습니다.</p>
              <Link href={goToPurchase(videoId)}>
                <button className="bg-blue-500 text-white py-2 px-6 rounded">
                  구매하기
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
