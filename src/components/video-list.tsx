'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import CardContainer from './CardContainer';
import { OnlineCards } from '@/types/online';

export default function VideoList() {
  const [videos, setVideos] = useState<OnlineCards[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch('/api/videos');
        if (res.ok) {
          const data = await res.json();
          setVideos(data);
        } else {
          toast('Failed to fetch videos');
        }
      } catch (error) {
        toast(`Failed to connect server: ${error}`);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) return <p>📡 비디오 불러오는 중...</p>;

  return (
    <div className="w-[1200px] items-center mx-auto justify-center flex flex-col">
      <h1 className="text-2xl font-bold mb-4">🎥 전체 비디오 목록</h1>
      {
        videos.length === 0 ? (
          <p>📭 등록된 비디오가 없습니다.</p>
        ) : (
          <CardContainer layout={'horizontal'} cards={videos} />
        )
        // <ul className="space-y-4">
        //   {videos.map((video, index) => (
        //     <div
        //       key={index}
        //       className="p-4 border rounded-lg shadow relative w-[225px] h-[225px]"
        //     >
        //       <Link href={goToVideoDetails(video.videoId)}>
        //         <Image
        //           src="/img/resume_lecture.jpeg"
        //           alt=""
        //           fill
        //           className="rounded"
        //         />
        //         <h2 className="mt-2">{video.title}</h2>
        //       </Link>
        //     </div>
        //   ))}
        // </ul>
        // )
      }
    </div>
  );
}
