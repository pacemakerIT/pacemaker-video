'use client';
import { WistiaPlayer } from '@wistia/wistia-player-react';
import Link from 'next/link';
import { usePurchase } from '@/app/context/purchase-context';
import { useAuth } from '@clerk/nextjs';
import { use, useEffect, useState } from 'react';
import DetailHeader from '@/components/common/detail-header';

export default function VideoDetails({
  params
}: {
  params: Promise<{ videoId: string }>;
}) {
  const { userId } = useAuth();
  const { videoId } = use(params);
  const { isPurchased } = usePurchase();
  const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   // Validate video ID format
  //   if (!/^[a-zA-Z0-9]+$/.test(videoId)) {
  //     setError('Invalid video ID format');
  //     return;
  //   }

  //   // Check if video exists in database
  //   const validateVideo = async () => {
  //     try {
  //       const response = await fetch(`/api/videos/${videoId}`);
  //       if (!response.ok) {
  //         if (response.status === 404) {
  //           setError('Video not found');
  //         } else {
  //           setError('An error occurred while loading the video');
  //         }
  //       }
  //     } catch {
  //       setError('Failed to load video');
  //     }
  //   };

  //   validateVideo();
  // }, [videoId]);

  // function goToPurchase(videoId: string): string {
  //   if (!userId) {
  //     return `/sign-in?redirect_url=/${videoId}`;
  //   } else {
  //     return `/mypage/purchases/${videoId}`;
  //   }
  // }

  // if (error) {
  //   return (
  //     <div className="flex h-screen items-center justify-center p-4">
  //       <div className="text-center space-y-4">
  //         <div className="text-red-500 text-xl font-semibold mb-4">{error}</div>
  //         <p className="text-gray-600">
  //           The video you&apos;re looking for might have been removed or is
  //           unavailable.
  //         </p>
  //         <Link href="/">
  //           <button className="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 transition-colors">
  //             Go to Home
  //           </button>
  //         </Link>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="w-screen flex flex-col">
      <DetailHeader />
    </div>
    // <div className="flex h-screen items-center justify-center p-4">
    //   <div className="w-full max-w-4xl mx-auto relative">
    //     <div className={!isPurchased ? 'pointer-events-none opacity-50' : ''}>
    //       <WistiaPlayer mediaId={videoId} />
    //     </div>

    //     {!isPurchased && (
    //       <>
    //         <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center space-y-4 z-10">
    //           <p className="text-white text-lg">구매 후 시청할 수 있습니다.</p>
    //           <Link href={goToPurchase(videoId)}>
    //             <button className="bg-blue-500 text-white py-2 px-6 rounded">
    //               구매하기
    //             </button>
    //           </Link>
    //         </div>
    //       </>
    //     )}
    //   </div>
    // </div>
  );
}
