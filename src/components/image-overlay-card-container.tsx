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
  const [cardWidth, setCardWidth] = React.useState(588);
  const [isMobile, setIsMobile] = React.useState(false);
  const [isTablet, setIsTablet] = React.useState(false);
  const gap = 24;

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
        setCardWidth(588);
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
    const visibleCards = isMobile ? 1 : isTablet ? 1 : 2;
    if (currentIndex < cards.length - visibleCards) {
      setCurrentIndex((prev) => prev + 1);
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
      {/* Prev Button */}
      {currentIndex > 0 && (
        <button
          aria-label="previous"
          className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-[background-color,color,transform] duration-[400ms] ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input absolute left-0 top-[230px] -translate-y-1/2 -translate-x-1/2 z-50 h-16 w-16 rounded-full bg-white text-navy shadow-2xl hover:bg-orange hover:text-white ${
            isMobile ? 'left-2' : ''
          }`}
          onClick={handlePrev}
        >
          <ChevronLeft className="h-8 w-8" />
        </button>
      )}

      {/* Viewport Container (Handles the clipping of cards) */}
      <div
        className={`${isMobile ? 'w-full overflow-hidden' : 'min-w-[1200px]'}`}
      >
        {/* Actual moving inner container */}
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
              <ImageOverlayCard {...card} />
            </div>
          ))}
        </div>
      </div>

      {/* Next Button */}
      {currentIndex < cards.length - (isMobile ? 1 : isTablet ? 1 : 2) && (
        <button
          aria-label="next"
          className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-[background-color,color,transform] duration-[400ms] ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input absolute top-[230px] -translate-y-1/2 z-50 h-16 w-16 rounded-full bg-white text-navy shadow-2xl hover:bg-orange hover:text-white ${
            isMobile
              ? '-right-4'
              : isTablet
                ? 'right-0 translate-x-1/2'
                : 'right-[calc(100%-1225px)]'
          }`}
          onClick={handleNext}
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      )}
    </div>
  );
}
