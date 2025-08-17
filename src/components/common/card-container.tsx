'use client';
import * as React from 'react';
import Card from './card';
import { OnlineCards } from '@/types/online';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

interface CardContainerProps {
  layout: 'grid' | 'horizontal';
  cards: OnlineCards[];
  imageType?: 'ebook' | 'course';
}

export default function CardContainer({
  layout,
  cards,
  imageType = 'course'
}: CardContainerProps) {
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
      <div className="justify-center grid grid-cols-4 md:grid-cols-2 gap-6 w-full py-4">
        {cards.map((card) => (
          <Card
            key={card.id}
            id={card.id}
            title={card.title}
            price={card.price}
            description={card.description}
            category={card.category}
            videoId={card.videoId}
            uploadDate={card.uploadDate}
            watchedVideos={card.watchedVideos}
            purchasedVideos={card.purchasedVideos}
            imageType={imageType}
            thumbnail={card.thumbnail}
          />
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
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 bg-white rounded-full shadow-md hover:bg-gray-100 w-14 h-14"
          onClick={handlePrev}
          aria-label="previous"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      )}
      <div
        ref={containerRef}
        className="flex gap-4 pb-4 w-[calc(100vw-360px)] overflow-hidden"
      >
        {cards.map((card) => (
          <div key={card.id} className="flex-none">
            <Card
              id={card.id}
              title={card.title}
              price={card.price}
              description={card.description}
              category={card.category}
              videoId={card.videoId}
              uploadDate={card.uploadDate}
              watchedVideos={card.watchedVideos}
              purchasedVideos={card.purchasedVideos}
              imageType={imageType}
              thumbnail={card.thumbnail}
            />
          </div>
        ))}
      </div>
      {currentIndex < cards.length - 2 && (
        <Button
          variant="outline"
          size="icon"
          className="absolute md:right-[calc(100%-1210px)] top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md hover:bg-gray-100 w-14 h-14"
          onClick={handleNext}
          aria-label="next"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
