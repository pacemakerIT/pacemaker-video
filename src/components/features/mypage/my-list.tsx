'use client';

import React from 'react';
import { useMemo, useState } from 'react';
import { MyCard } from '@/types/my-card';
import BadgeHeader from './my-account-badge-header';
import MyLearningListCardContainer from './my-list-card-container';

interface MyListProps {
  title: string;
  cards: MyCard[];
}

export default function MyLearningList({ title, cards }: MyListProps) {
  const category = useMemo(
    () => ['All', 'In progress', 'Not started', 'Completed'],
    []
  );
  const [currentCategory, setCurrentCategory] = useState<string>('All');
  const [allCards] = useState<MyCard[]>(cards);

  const currentCards = useMemo(() => {
    if (currentCategory === 'All') {
      return allCards;
    }

    return allCards.filter((card) => {
      const { completedChapters, totalChapters } = card;

      if (!completedChapters || !totalChapters) {
        return currentCategory === 'Not started';
      }

      const progress = (completedChapters / totalChapters) * 100;

      switch (currentCategory) {
        case 'In progress':
          return progress > 0 && progress < 100;
        case 'Not started':
          return progress === 0;
        case 'Completed':
          return progress === 100;
        default:
          return true;
      }
    });
  }, [currentCategory, allCards]);

  return (
    <section className="mb-12 last:mb-0">
      <h2 className="mb-4 font-headline text-2xl font-bold tracking-tight text-[#00263B]">
        {title}
      </h2>
      <BadgeHeader
        category={category}
        currentCategory={currentCategory}
        setCurrentCategory={setCurrentCategory}
      />
      {currentCards.length ? (
        <MyLearningListCardContainer cards={currentCards} />
      ) : (
        <p className="border-t border-gray-100 py-10 text-sm text-[#667085]">
          No items found.
        </p>
      )}
    </section>
  );
}
