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
  const containerRef = React.useRef<HTMLDivElement>(null);
  const cardWidth = 588; // Card 컴포넌트의 width 값
  const gap = 16; // gap-4 = 16px

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      if (containerRef.current) {
        containerRef.current.scrollTo({
          left: (currentIndex - 1) * (cardWidth + gap),
          behavior: 'smooth'
        });
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      if (containerRef.current) {
        containerRef.current.scrollTo({
          left: (currentIndex + 1) * (cardWidth + gap),
          behavior: 'smooth'
        });
      }
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
            <ImageOverlayCard
              id={card.id}
              title={card.title}
              price={card.price}
              description={card.description}
              category={card.category}
              videoId={card.videoId}
              uploadDate={card.uploadDate}
              watchedVideos={card.watchedVideos}
              purchasedVideos={card.purchasedVideos}
              thumbnail={card.thumbnail}
            />
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
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input hover:text-accent-foreground absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 bg-white rounded-full shadow-md hover:bg-gray-100 w-14 h-14"
          onClick={handlePrev}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}
      <div
        ref={containerRef}
        className="flex gap-4 pb-4 w-[calc(100vw-360px)] overflow-hidden"
      >
        {cards.map((card) => (
          <div key={card.id} className="flex-none">
            <ImageOverlayCard
              id={card.id}
              title={card.title}
              price={card.price}
              description={card.description}
              category={card.category}
              videoId={card.videoId}
              uploadDate={card.uploadDate}
              watchedVideos={card.watchedVideos}
              purchasedVideos={card.purchasedVideos}
              thumbnail={card.thumbnail}
            />
          </div>
        ))}
      </div>
      {currentIndex < cards.length - 2 && (
        <button
          aria-label="next"
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input hover:text-accent-foreground absolute right-[calc(100%-1210px)] top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md hover:bg-gray-100 w-14 h-14"
          onClick={handleNext}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
