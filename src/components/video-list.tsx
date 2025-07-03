'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import CardContainer from './CardContainer';
import { OnlineCards } from '@/types/online';
import Link from 'next/link';
import Image from 'next/image';

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

  return (
    <>
      {loading ? (
        <p>📡 비디오 불러오는 중...</p>
      ) : (
        <>
          <div className="flex flex-col justify-start w-full pt-12">
            <h5 className="text-pace-orange-600 text-lg">
              {'북미 취업의 A to Z'}
            </h5>
            <div className="flex justify-between items-center">
              <h3 className="text-pace-black-500 text-pace-3xl font-bold">
                {'페이스메이커 온라인 강의'}
              </h3>
              <Link
                href="/courses"
                className="w-fit flex items-center text-base text-pace-stone-500 font-normal gap-1"
              >
                <span>{'온라인강의 전체 보기'}</span>
                <Image
                  src="/icons/arrow_right.svg"
                  alt="오른쪽 화살표 아이콘"
                  width={16}
                  height={16}
                  className="align-middle"
                />
              </Link>
            </div>
          </div>
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
        </>
      )}
    </>
  );
}
