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
    const fetchEbooks = async () => {
      try {
        const res = await fetch('/api/ebooks?isMain=true');
        if (res.ok) {
          const data = await res.json();
          setEbooks(data);
        } else {
          toast('Failed to fetch ebooks');
        }
      } catch (error) {
        toast(`Failed to connect server: ${error}`);
      } finally {
        setLoading(false);
      }
    };

    fetchEbooks();
  }, []);

  return (
    <section className="w-full gap-8">
      {loading ? (
        <p className="text-center">📡 Loading ebooks...</p>
      ) : (
        <div className="flex w-full max-w-7xl flex-col gap-12">
          {/* Header Section */}
          <div className="flex w-full flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h5 className="mb-2 text-base font-bold tracking-wide text-orange">
                {'Job search tips, plain and simple'}
              </h5>
              <h3 className="font-headline text-4xl font-extrabold tracking-tight text-navy md:text-5xl">
                {'Pacemaker e-books'}
              </h3>
            </div>
            <Link
              href="/ebooks"
              className="flex w-fit items-center gap-1 text-sm font-semibold text-slate-400 transition-colors hover:text-navy"
            >
              <span>{'View all e-books'}</span>
              <Image
                src="/icons/arrow_right.svg"
                alt="오른쪽 화살표 아이콘"
                width={16}
                height={16}
                className="align-middle"
              />
            </Link>
          </div>

          {/* Card Container Section */}
          {ebooks.length === 0 ? (
            <p className="text-center text-pace-base">
              📭 No registered ebooks.
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
