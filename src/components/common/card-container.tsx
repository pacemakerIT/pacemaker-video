'use client';
import * as React from 'react';
import Card from './card';
import { OnlineCards } from '@/types/online';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [cardWidth, setCardWidth] = React.useState(384);
  const [isMobile, setIsMobile] = React.useState(false);
  const [isTablet, setIsTablet] = React.useState(false);
  const gap = 24;
  const visibleCardCount = isMobile ? 1 : 3;
  const maxIndex = Math.max(cards.length - visibleCardCount, 0);

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      const tablet = width >= 768 && width < 1248;

      setIsMobile(mobile);
      setIsTablet(tablet);

      if (mobile) {
        // Mobile: Show only one card (full width minus horizontal padding)
        const newWidth = width - 48; // 24px padding on each side
        setCardWidth(newWidth);
      } else {
        setCardWidth(384);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalMovement = cardWidth + gap;

  // Sync offsetX when cardWidth or currentIndex changes (especially on resize)
  React.useEffect(() => {
    setOffsetX(currentIndex * totalMovement);
  }, [currentIndex, totalMovement]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < maxIndex) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  if (layout === 'grid') {
    return (
      <div className="grid w-full grid-cols-1 gap-x-12 gap-y-16 py-4 md:grid-cols-2">
        {cards.map((card) => (
          <Card key={card.id} {...card} itemType={itemType} />
        ))}
      </div>
    );
  }

  return (
    <div className="relative w-full" data-testid="horizontal-container">
      {/* Prev Button */}
      {currentIndex > 0 && (
        <button
          aria-label="previous"
          className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-[background-color,color,transform] duration-[400ms] ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input absolute left-0 top-[230px] -translate-y-1/2 -translate-x-1/2 z-50 h-14 w-14 rounded-full bg-white text-navy shadow-2xl hover:bg-orange hover:text-white ${
            isMobile ? 'left-2' : ''
          }`}
          onClick={handlePrev}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Viewport Container */}
      <div
        className={`${isMobile ? 'w-full overflow-hidden' : 'min-w-[1200px]'}`}
      >
        {/* Actual Moving Track */}
        <div
          className={`flex gap-6 pb-4 transition-transform duration-500 ease-in-out ${isMobile ? 'px-6' : ''}`}
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

      {/* Next Button */}
      {currentIndex < maxIndex && (
        <button
          aria-label="next"
          className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-[background-color,color,transform] duration-[400ms] ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input absolute top-[230px] -translate-y-1/2 z-50 h-14 w-14 rounded-full bg-white text-navy shadow-2xl hover:bg-orange hover:text-white ${
            isMobile
              ? '-right-4'
              : isTablet
                ? 'right-0 translate-x-1/2'
                : 'right-[calc(100%-1225px)]'
          }`}
          onClick={handleNext}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
