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
    <section className="w-full  gap-8">
      {loading ? (
        <p className="text-center">📡 코스 불러오는 중...</p>
      ) : (
        <div className="flex flex-col w-full max-w-7xl gap-8">
          {/* Header Section */}
          <div className="flex flex-col justify-center">
            <h5 className="text-pace-orange-600 text-lg">
              {'Empowering Your Career'}
            </h5>
            <div className="flex justify-between items-center ">
              <h3 className="text-pace-black-500 text-pace-3xl font-bold">
                {'Pacemaker Online Courses'}
              </h3>
              <Link
                href="/courses"
                className="w-fit flex items-center text-base text-pace-stone-500 font-normal gap-1"
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
          </div>

          {/* Card Container Section */}
          {courses.length === 0 ? (
            <p className="text-center">📭 등록된 코스가 없습니다.</p>
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
