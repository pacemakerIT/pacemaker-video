'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { OnlineCards } from '@/types/online';
import Link from 'next/link';
import Image from 'next/image';
import CardContainer from '../../common/card-container';
import { ItemType } from '@prisma/client';

export default function EbookList() {
  const [ebooks, setEbooks] = useState<OnlineCards[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch('/api/ebooks?isMain=true');
        if (res.ok) {
          const data = await res.json();
          setEbooks(data);
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
    <section className="w-full gap-8">
      {loading ? (
        <p className="text-center">📡 전자책 불러오는 중...</p>
      ) : (
        <div className="flex flex-col w-full max-w-7xl gap-8">
          {/* Header Section */}
          <div className="flex flex-col justify-start w-full pt-12">
            <h5 className="text-pace-orange-600 text-pace-lg">
              {'Career Breakthroughs'}
            </h5>
            <div className="flex justify-between items-center">
              <h3 className="text-pace-black-500 text-pace-3xl font-bold">
                {'Pacemaker E-books'}
              </h3>
              <Link
                href="/ebooks"
                className="w-fit flex items-center text-pace-base text-pace-stone-500 font-normal gap-1"
              >
                <span>{'View all E-books'}</span>
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
          {ebooks.length === 0 ? (
            <p className="text-center text-pace-base">
              📭 등록된 전자책이 없습니다.
            </p>
          ) : (
            <CardContainer
              layout={'horizontal'}
              cards={ebooks}
              itemType={ItemType.EBOOK}
            />
          )}
        </div>
      )}
    </section>
  );
}
