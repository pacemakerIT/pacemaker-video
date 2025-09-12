'use client';
import * as React from 'react';
import Card from './card';
import { OnlineCards } from '@/types/online';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { ItemType } from '@prisma/client';

interface CardContainerProps {
  layout: 'grid' | 'horizontal';
  cards: OnlineCards[];
  itemType?: ItemType;
}

export default function CardContainer({
  layout,
  cards,
  itemType
}: CardContainerProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [offsetX, setOffsetX] = React.useState(0);

  const cardWidth = 588;
  const gap = 24;
  const totalMovement = cardWidth + gap;

  const handlePrev = () => {
    // currentIndex를 기준으로 새로운 offsetX 계산
    const newIndex = currentIndex - 1;
    if (newIndex >= 0) {
      setCurrentIndex(newIndex);
      setOffsetX(newIndex * totalMovement);
    }
  };

  const handleNext = () => {
    // currentIndex를 기준으로 새로운 offsetX 계산
    const newIndex = currentIndex + 1;
    if (newIndex < cards.length) {
      setCurrentIndex(newIndex);
      setOffsetX(newIndex * totalMovement);
    }
  };

  if (layout === 'grid') {
    return (
      <div className="justify-center grid grid-cols-4 md:grid-cols-2 gap-6 w-full py-4">
        {cards.map((card) => (
          <Card key={card.id} {...card} itemType={itemType} />
        ))}
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {currentIndex > 0 && (
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-[290px] -translate-y-1/2 -translate-x-1/2 z-10 bg-white rounded-full shadow-md hover:bg-gray-100 w-14 h-14"
          onClick={handlePrev}
          aria-label="previous"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      )}

      {/* 구조 변경: 뷰포트 역할을 하는 외부 div와 실제 움직이는 내부 div로 분리 */}
      <div className="w-[1200px]">
        <div
          className="flex gap-6 pb-4 transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${offsetX}px)` }}
        >
          {cards.map((card) => (
            <div
              key={card.id}
              className="flex-none"
              style={{ width: `${cardWidth}px` }}
            >
              <Card {...card} itemType={itemType} />
            </div>
          ))}
        </div>
      </div>
      {currentIndex < cards.length - 2 && (
        <Button
          variant="outline"
          size="icon"
          className="absolute md:right-[calc(100%-1225px)] top-[290px] -translate-y-1/2 z-10 bg-white rounded-full shadow-md hover:bg-gray-100 w-14 h-14"
          onClick={handleNext}
          aria-label="next"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
