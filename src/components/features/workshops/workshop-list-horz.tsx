'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { OnlineCards } from '@/types/online';
import Link from 'next/link';
import Image from 'next/image';
import ImageOverlayCardContainer from '../../image-overlay-card-container';

export default function WorkshopList() {
  const [workshops, setWorkshops] = useState<OnlineCards[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const res = await fetch('/api/workshops');
        if (res.ok) {
          const data = await res.json();
          // API returns { workshops: [...], count: ... }
          setWorkshops(data.workshops || []);
        } else {
          toast('Failed to fetch workshops');
        }
      } catch (error) {
        toast(`Failed to connect server: ${error}`);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshops();
  }, []);

  return (
    <section className="w-full gap-8">
      {loading ? (
        <p className="text-center">📡 워크샵 불러오는 중...</p>
      ) : (
        <div className="flex flex-col w-full max-w-7xl gap-8">
          <div className="flex flex-col justify-start w-full pt-12">
            <h5 className="text-pace-orange-600 text-lg">
              {'Explore Career Topics'}
            </h5>
            <div className="flex justify-between items-center">
              <h3 className="text-pace-black-500 text-pace-3xl font-bold">
                {'Pacemaker Workshop'}
              </h3>
              <Link
                href="/workshops"
                className="w-fit flex items-center text-base text-pace-stone-500 font-normal gap-1"
              >
                <span>{'View all Workshops'}</span>
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
          {workshops.length === 0 ? (
            <p>📭 등록된 워크샵이 없습니다.</p>
          ) : (
            <ImageOverlayCardContainer
              layout={'horizontal'}
              cards={workshops}
            />
          )}
        </div>
      )}
    </section>
  );
}
