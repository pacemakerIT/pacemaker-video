'use client';

import React from 'react';
import { useMemo, useState } from 'react';
import { MyCard } from '@/types/my-card';
import BadgeHeader from './badge-header';
import MyLearningListCardContainer from './my-list-card-container';

interface MyListProps {
  title: string;
  cards: MyCard[];
}

export default function MyLearningList({ title, cards }: MyListProps) {
  const category = useMemo(() => ['전체', '수강중', '미수강', '수강완료'], []);
  const [currentCategory, setCurrentCategory] = useState<string>('전체');
  const [allCards] = useState<MyCard[]>(cards);

  const currentCards = useMemo(() => {
    if (currentCategory === '전체') {
      return allCards;
    }

    return allCards.filter((card) => {
      const { completedChapters, totalChapters } = card;

      if (!completedChapters || !totalChapters) {
        return currentCategory === '미수강';
      }

      const progress = (completedChapters / totalChapters) * 100;

      switch (currentCategory) {
        case '수강중':
          return progress > 0 && progress < 100;
        case '미수강':
          return progress === 0;
        case '수강완료':
          return progress === 100;
        default:
          return true;
      }
    });
  }, [currentCategory, allCards]);

  if (!allCards || allCards.length === 0) {
    return <div>강의가 없습니다.</div>;
  }

  return (
    <div className="my-20 mx-10">
      <h1 className="text-pace-gray-700 font-bold text-pace-xl">{title}</h1>
      <BadgeHeader
        category={category}
        currentCategory={currentCategory}
        setCurrentCategory={setCurrentCategory}
      />
      <MyLearningListCardContainer cards={currentCards} />
    </div>
  );
}
