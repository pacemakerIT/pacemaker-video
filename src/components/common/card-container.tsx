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
  const containerRef = React.useRef<HTMLDivElement>(null);
  const didInitRef = React.useRef(false);
  const cardWidth = 588; // Card 컴포넌트의 width 값
  const gap = 24; // gap-6 = 24px

  // 초기 위치: 첫 번째 카드가 절반만 보이도록 (왼쪽 빈 카드 고려)
  React.useEffect(() => {
    if (didInitRef.current) return;
    if (containerRef.current) {
      containerRef.current.scrollLeft = cardWidth + gap - cardWidth / 2;
      didInitRef.current = true;
    }
  }, [cardWidth, gap]);

  const PlaceholderCard = () => (
    <div className="flex-none bg-transparent">
      <div className="w-[652px] bg-transparent rounded-lg shadow-sm border-transparent border"></div>
    </div>
  );
  const handlePrev = () => {
    if (currentIndex > 0) {
      const nextIndex = currentIndex - 1;
      setCurrentIndex(nextIndex);
      if (containerRef.current) {
        containerRef.current.scrollTo({
          left: (nextIndex + 1) * (cardWidth + gap) - cardWidth / 2,
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
        containerRef.current.scrollTo({
          left: (nextIndex + 1) * (cardWidth + gap) - cardWidth / 2,
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
            itemId={card.itemId}
            uploadDate={card.uploadDate}
            watchedVideos={card.watchedVideos}
            purchasedVideos={card.purchasedVideos}
            itemType={itemType}
            thumbnail={card.thumbnail}
          />
        ))}
      </div>
    );
  }
  // 왼쪽 화살표: 첫 번째 카드가 완전히 보일 때부터 표시
  const showLeftButton = currentIndex > 0;
  // 오른쪽 화살표: 마지막 카드가 중앙 2개 카드 영역의 2번째 위치에 완전히 보일 때까지 표시
  const showRightButton = currentIndex < cards.length - 2;

  return (
    <div className="relative w-screen">
      {showLeftButton && (
        <Button
          variant="outline"
          size="icon"
          className="absolute left-[360px] top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 bg-white rounded-full shadow-md hover:bg-gray-100 w-14 h-14"
          onClick={handlePrev}
          aria-label="previous"
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
              <Card
                id={card.id}
                title={card.title}
                price={card.price}
                description={card.description}
                category={card.category}
                itemId={card.itemId}
                uploadDate={card.uploadDate}
                watchedVideos={card.watchedVideos}
                purchasedVideos={card.purchasedVideos}
                itemType={itemType}
                thumbnail={card.thumbnail}
              />
            </div>
          ))}

          {/* 오른쪽 빈 카드 - 항상 존재 */}
          <PlaceholderCard />
        </div>
      </div>

      {showRightButton && (
        <Button
          variant="outline"
          size="icon"
          className="absolute right-[360px] top-1/2 -translate-y-1/2 translate-x-1/2 z-10 bg-white rounded-full shadow-md hover:bg-gray-100 w-14 h-14"
          onClick={handleNext}
          aria-label="next"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
