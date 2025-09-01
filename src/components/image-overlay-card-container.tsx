'use client';
import * as React from 'react';
import { OnlineCards } from '@/types/online';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ImageOverlayCard from './image-overlay-card';
import { Button } from './ui/button';

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
  const didInitRef = React.useRef(false);
  const cardWidth = 384; // Card 컴포넌트의 width 값
  const gap = 16; // gap-4 = 16px

  React.useEffect(() => {
    if (didInitRef.current) return;
    if (containerRef.current) {
      containerRef.current.scrollLeft = 50 + 0 * (cardWidth + gap);
      didInitRef.current = true;
    }
  }, [cardWidth, gap]);

  const PlaceholderCard = () => (
    <div className="flex-none bg-transparent">
      <div className="w-[384px] bg-transparent rounded-lg shadow-sm border-transparent border"></div>
    </div>
  );

  const handlePrev = () => {
    if (currentIndex > 0) {
      const nextIndex = currentIndex - 1;
      setCurrentIndex(nextIndex);
      if (containerRef.current) {
        const isFirstClick = currentIndex === 1;
        const scrollPosition =
          50 + nextIndex * (cardWidth + gap) + (isFirstClick ? 5 : 10);
        containerRef.current.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      if (containerRef.current) {
        const isFirstClick = currentIndex === 0;
        const scrollPosition =
          50 +
          nextIndex * (cardWidth + gap) +
          (isFirstClick ? 5 : 10 * currentIndex);
        containerRef.current.scrollTo({
          left: scrollPosition,
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
              itemId={card.itemId}
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

  // 왼쪽 화살표: 첫 번째 카드가 완전히 보일 때부터 표시
  const showLeftButton = currentIndex > 0;
  // 오른쪽 화살표: 마지막 카드가 중앙 3개 카드 영역의 3번째 위치에 완전히 보일 때까지 표시
  const showRightButton = currentIndex < cards.length - 3;

  return (
    <div className="relative w-screen" data-testid="horizontal-container">
      {showLeftButton && (
        <Button
          aria-label="previous"
          className="absolute left-[360px] top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 bg-white rounded-full shadow-md hover:bg-gray-100 w-14 h-14"
          onClick={handlePrev}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      )}
      <div ref={containerRef} className="overflow-hidden">
        <div className="flex gap-6 pb-4">
          {/* 왼쪽 빈 카드 - 항상 존재 */}
          <PlaceholderCard />

          {/* 실제 카드들 */}
          {cards.map((card) => (
            <div key={card.id} className="flex-none">
              <ImageOverlayCard
                id={card.id}
                title={card.title}
                price={card.price}
                description={card.description}
                category={card.category}
                itemId={card.itemId}
                uploadDate={card.uploadDate}
                watchedVideos={card.watchedVideos}
                purchasedVideos={card.purchasedVideos}
                thumbnail={card.thumbnail}
              />
            </div>
          ))}

          {/* 오른쪽 빈 카드 - 항상 존재 */}
          <PlaceholderCard />
        </div>
        {showRightButton && (
          <Button
            aria-label="next"
            className="absolute right-[360px] top-1/2 -translate-y-1/2 translate-x-1/2 z-10 bg-white rounded-full shadow-md hover:bg-gray-100 w-14 h-14"
            onClick={handleNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        )}
      </div>
    </div>
  );
}
