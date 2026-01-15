'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import CardContainer from '@/components/common/card-container';
import CourseHeader from '@/components/features/course/course-header';
import { OnlineCards } from '@/types/online';
import { toast } from 'sonner';
import { ItemType } from '@prisma/client';

export default function CourseList() {
  const category = useMemo(
    () => ['TOTAL', 'INTERVIEW', 'RESUME', 'NETWORKING'],
    []
  );
  const [currentCategory, setCurrentCategory] = useState<string>('TOTAL');
  const [sortBy, setSortBy] = useState<string>('Total');
  const [allCards, setAllCards] = useState<OnlineCards[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch('/api/courses');
      if (res.ok) {
        const data = await res.json();
        setAllCards(data);
      } else {
        toast('Failed to fetch courses');
      }
    } catch (error) {
      toast(`Failed to connect server: ${error}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const currentCards = useMemo(() => {
    if (currentCategory === 'TOTAL') {
      return allCards;
    }
    return allCards.filter((card) => card.category === currentCategory);
  }, [currentCategory, allCards]);

  return (
    <div className="w-[1200px] items-center mx-auto justify-center flex flex-col ">
      {loading ? (
        <p className="p-4">📡 강의 불러오는 중...</p>
      ) : (
        <>
          <CourseHeader
            category={category}
            currentCategory={currentCategory}
            setCurrentCategory={setCurrentCategory}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
          <CardContainer
            layout={'grid'}
            cards={currentCards}
            itemType={ItemType.COURSE}
          />
        </>
      )}
    </div>
  );
}
