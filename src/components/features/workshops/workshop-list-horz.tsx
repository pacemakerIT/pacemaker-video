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
        <p className="text-center">📡 Loading workshops...</p>
      ) : (
        <div className="flex w-full max-w-7xl flex-col gap-12">
          <div className="flex w-full flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h5 className="mb-2 text-base font-bold tracking-wide text-orange">
                {'Workshops for every goal'}
              </h5>
              <h3 className="font-headline text-4xl font-extrabold tracking-tight text-navy md:text-5xl">
                {'Pacemaker workshops'}
              </h3>
            </div>
            <Link
              href="/workshops"
              className="flex w-fit items-center gap-1 text-base font-semibold text-slate-500 transition-colors hover:text-navy"
            >
              <span>{'View all workshops'}</span>
              <Image
                src="/icons/arrow_right.svg"
                alt="오른쪽 화살표 아이콘"
                width={16}
                height={16}
                className="align-middle"
              />
            </Link>
          </div>
          {workshops.length === 0 ? (
            <p>📭 No registered workshops.</p>
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
