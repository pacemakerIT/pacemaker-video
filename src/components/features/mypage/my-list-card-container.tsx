'use client';
import * as React from 'react';
import { MyCard } from '@/types/my-card';
import MyPageCard from '@/components/features/mypage/my-page-card';

interface CardContainerProps {
  cards: MyCard[];
}

export default function MyLearningListCardContainer({
  cards
}: CardContainerProps) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.id} className="w-full">
            <MyPageCard
              id={card.id}
              itemId={card.itemId}
              title={card.title}
              category={card.category}
              type={card.type}
              purchased={card.purchased}
              totalChapters={card.totalChapters}
              completedChapters={card.completedChapters}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
