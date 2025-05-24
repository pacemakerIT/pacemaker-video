'use client';
import * as React from 'react';
import Card from './Card';
import { OnlineCards } from '@/types/online';

interface CardContainerProps {
  layout: 'grid' | 'horizontal';
  cards: OnlineCards[];
}

export default function CardContainer({ layout, cards }: CardContainerProps) {
  if (layout === 'grid') {
    return (
      <div className="justify-center grid grid-cols-4 md:grid-cols-2 gap-6 w-full">
        {cards.map((card) => (
          <Card
            key={card.id}
            id={card.id}
            title={card.title}
            price={card.price}
            description={card.description}
            image={card.image}
            category={card.category}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex overflow-scroll gap-4 pb-4 w-full">
      {cards.map((card) => (
        <div key={card.id} className="flex-none">
          <Card
            id={card.id}
            title={card.title}
            price={card.price}
            description={card.description}
            image={card.image}
            category={card.category}
          />
        </div>
      ))}
    </div>
  );
}
