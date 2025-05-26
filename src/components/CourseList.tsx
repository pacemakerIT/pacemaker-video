'use client';

import { useState, useEffect } from 'react';
import CardContainer from '@/components/CardContainer';
import CourseHeader from '@/components/CourseHeader';
import { OnlineCards } from '@/types/online';
import { toast } from 'sonner';

export default function CourseList() {
  const category = ['TOTAL', 'INTERVIEW', 'RESUME', 'NETWORKING'];
  const [currentCategory, setCurrentCategory] = useState<string>('TOTAL');
  const [sortBy, setSortBy] = useState<string>('Total');
  const [allCards, setAllCards] = useState<OnlineCards[]>([]);
  const [currentCards, setCurrentCards] = useState<OnlineCards[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses');
        if (res.ok) {
          const data = await res.json();
          setAllCards(data);
          setCurrentCards(data);
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

  useEffect(() => {
    if (currentCategory === 'TOTAL') {
      setCurrentCards(allCards);
    } else {
      const filterCards = allCards.filter(
        (card) => card.category === currentCategory
      );
      setCurrentCards(filterCards);
    }
  }, [currentCategory, allCards]);

  return (
    <div className="w-[1200px] items-center mx-auto justify-center flex flex-col">
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
          <CardContainer layout={'grid'} cards={currentCards} />
        </>
      )}
    </div>
  );
}
