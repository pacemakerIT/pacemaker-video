import { auth } from '@clerk/nextjs/server';
import { WistiaPlayer } from '@wistia/wistia-player-react';
import Link from 'next/link';

export default async function VideoDetails({
  params
}: {
  params: Promise<{ mediaId: string }>;
}) {
  const { userId } = await auth();
  const mediaId = (await params).mediaId;
  const purchased = false;

  function goToPurchase(mediaId: string): string {
    if (!userId) {
      return `/sign-in?redirect_url=/${mediaId}`;
    } else {
      return `/purchase/${mediaId}`;
    }
  }

  return (
    <div className="flex h-screen items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto relative">
        <div className={!purchased ? 'pointer-events-none opacity-50' : ''}>
          <WistiaPlayer mediaId={mediaId} />
        </div>

        {!purchased && (
          <>
            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center space-y-4 z-10">
              <p className="text-white text-lg">구매 후 시청할 수 있습니다.</p>
              <Link href={goToPurchase(mediaId)}>
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
