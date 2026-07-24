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
    const filtered =
      currentCategory === 'TOTAL'
        ? allCards
        : allCards.filter((card) => card.category === currentCategory);

    if (sortBy === 'Date') {
      return [...filtered].sort(
        (a, b) =>
          new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      );
    }
    if (sortBy === 'Review') {
      return [...filtered].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }
    return filtered;
  }, [currentCategory, sortBy, allCards]);

  return (
    <div
      id="course-list"
      className="max-w-[1248px] w-full items-center mx-auto justify-center flex flex-col px-6 scroll-mt-20"
    >
      {loading ? (
        <p className="p-4">📡 Loading courses...</p>
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
