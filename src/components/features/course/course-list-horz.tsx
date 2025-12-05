'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import CardContainer from '../../common/card-container';
import { OnlineCards } from '@/types/online';
import Link from 'next/link';
import Image from 'next/image';
import { ItemType } from '@prisma/client';

export default function VideoList() {
  const [videos, setVideos] = useState<OnlineCards[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch('/api/courses');
        if (res.ok) {
          const data = await res.json();
          setVideos(data);
        } else {
          toast('Failed to fetch courses');
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
    <section className="w-full  gap-8">
      {loading ? (
        <p className="text-center">📡 비디오 불러오는 중...</p>
      ) : (
        <div className="flex flex-col w-full max-w-7xl gap-8">
          {/* Header Section */}
          <div className="flex flex-col justify-center">
            <h5 className="text-pace-orange-600 text-lg">
              {'북미 취업의 A to Z'}
            </h5>
            <div className="flex justify-between items-center ">
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

          {/* Card Container Section */}
          {videos.length === 0 ? (
            <p className="text-center">📭 등록된 비디오가 없습니다.</p>
          ) : (
            <CardContainer
              layout={'horizontal'}
              cards={videos}
              itemType={ItemType.VIDEO}
            />
          )}
        </div>
      )}
    </section>
  );
}
