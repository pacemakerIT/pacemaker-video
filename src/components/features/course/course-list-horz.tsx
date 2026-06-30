'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import CardContainer from '../../common/card-container';
import { OnlineCards } from '@/types/online';
import Link from 'next/link';
import Image from 'next/image';
import { ItemType } from '@prisma/client';

export default function CourseList() {
  const [courses, setCourses] = useState<OnlineCards[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses');
        if (res.ok) {
          const data = await res.json();
          setCourses(data);
        } else {
          toast('Failed to fetch courses');
        }
      } catch (error) {
        toast(`Failed to connect server: ${error}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <section className="w-full gap-8">
      {loading ? (
        <p className="text-center">📡 Loading courses...</p>
      ) : (
        <div className="flex w-full max-w-7xl flex-col gap-12">
          {/* Header Section */}
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h5 className="mb-2 text-base font-bold tracking-wide text-orange">
                {'North America jobs A to Z'}
              </h5>
              <h3 className="font-headline text-4xl font-extrabold tracking-tight text-navy md:text-5xl">
                {'Pacemaker online courses'}
              </h3>
            </div>
            <Link
              href="/courses"
              className="flex w-fit items-center gap-1 text-sm font-semibold text-slate-400 transition-colors hover:text-navy"
            >
              <span>{'View all courses'}</span>
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
          {courses.length === 0 ? (
            <p className="text-center">📭 No registered courses.</p>
          ) : (
            <CardContainer
              layout={'horizontal'}
              cards={courses}
              itemType={ItemType.COURSE}
            />
          )}
        </div>
      )}
    </section>
  );
}
