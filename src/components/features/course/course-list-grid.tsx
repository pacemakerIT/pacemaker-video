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

    const normalizedSort = sortBy.trim().toLowerCase();

    if (normalizedSort === 'date') {
      return [...filtered].sort((a, b) => {
        const dateA = a.uploadDate ?? a.createdAt ?? a.startDate;
        const dateB = b.uploadDate ?? b.createdAt ?? b.startDate;
        const timeA = dateA ? new Date(dateA).getTime() : 0;
        const timeB = dateB ? new Date(dateB).getTime() : 0;
        const safeTimeA = Number.isNaN(timeA) ? 0 : timeA;
        const safeTimeB = Number.isNaN(timeB) ? 0 : timeB;
        return safeTimeB - safeTimeA;
      });
    }

    if (normalizedSort === 'review') {
      return [...filtered].sort((a, b) => {
        const ratingDiff = Number(b.rating ?? 0) - Number(a.rating ?? 0);
        if (ratingDiff !== 0) return ratingDiff;

        const reviewCountDiff =
          Number(b.reviewCount ?? 0) - Number(a.reviewCount ?? 0);
        if (reviewCountDiff !== 0) return reviewCountDiff;

        return Number(b.likes ?? 0) - Number(a.likes ?? 0);
      });
    }

    return filtered;
  }, [currentCategory, allCards, sortBy]);

  return (
    <section id="course-list" className="w-full bg-white py-[80px]">
      <div className="mx-auto flex w-full max-w-[1248px] flex-col px-6">
        {loading ? (
          <p className="p-4 text-center">📡 Loading courses...</p>
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
    </section>
  );
}
