'use client';
import * as React from 'react';
import { OnlineCards } from '@/types/online';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ImageOverlayCard from './image-overlay-card';

interface ImageOverlayCardContainerProps {
  layout: 'grid' | 'horizontal';
  cards: OnlineCards[];
}

export default function ImageOverlayCardContainer({
  layout,
  cards
}: ImageOverlayCardContainerProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [offsetX, setOffsetX] = React.useState(0);

  const cardWidth = 384;
  const gap = 24;
  const totalMovement = cardWidth + gap;

  const handlePrev = () => {
    const newIndex = currentIndex - 1;
    if (newIndex >= 0) {
      setCurrentIndex(newIndex);
      setOffsetX(newIndex * totalMovement);
    }
  };

  const handleNext = () => {
    const newIndex = currentIndex + 1;
    if (newIndex < cards.length) {
      setCurrentIndex(newIndex);
      setOffsetX(newIndex * totalMovement);
    }
  };

  if (layout === 'grid') {
    return (
      <div
        className="justify-center grid grid-cols-4 md:grid-cols-2 gap-6 w-full py-4"
        data-testid="grid-container"
      >
        {cards.map((card) => (
          <div key={card.id} data-testid="image-overlay-card">
            <ImageOverlayCard {...card} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative w-full" data-testid="horizontal-container">
      {currentIndex > 0 && (
        <button
          aria-label="previous"
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input hover:text-accent-foreground absolute left-0 top-[230px] -translate-y-1/2 -translate-x-1/2 z-10 bg-white rounded-full shadow-md hover:bg-gray-100 w-14 h-14"
          onClick={handlePrev}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}
      {/* 뷰포트(viewport) 역할을 하는 외부 컨테이너 */}
      <div className="min-w-[1200px]">
        {/* 실제 움직이는 내부 컨테이너 */}
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
              <ImageOverlayCard {...card} />
            </div>
          ))}
        </div>
      </div>
      {currentIndex < cards.length - 3 && (
        <button
          aria-label="next"
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input hover:text-accent-foreground absolute right-[calc(100%-1225px)] top-[230px] -translate-y-1/2 z-10 bg-white rounded-full shadow-md hover:bg-gray-100 w-14 h-14"
          onClick={handleNext}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
