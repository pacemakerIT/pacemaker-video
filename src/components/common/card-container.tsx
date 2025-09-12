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

  // 초기 위치: 첫 번째 카드가 전체가 보이도록
  React.useEffect(() => {
    if (didInitRef.current) return;
    setCurrentIndex(0);
    didInitRef.current = true;
  }, []);

  const PlaceholderCard = () => (
    <div className="flex-none bg-transparent">
      <div className="w-[652px] bg-transparent rounded-lg border-transparent border"></div>
    </div>
  );
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
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
  const showRightButton = currentIndex < cards.length - 1;

  return (
    <div className="relative w-full max-w-7xl mx-auto">
      {/* Carousel Container */}
      <div ref={containerRef} className="relative">
        <div
          className="flex gap-6 pb-4 transition-transform duration-300 ease-in-out w-screen  ml-[calc(50%-50vw)]
  mr-[calc(50%-50vw)]
  pl-[calc(-50%+50vw)]"
          style={{
            transform: `translateX(-${currentIndex * (cardWidth + gap)}px)`
          }}
        >
          {/* <PlaceholderCard /> */}
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
          <PlaceholderCard />
        </div>
      </div>

      {/* 왼쪽 화살표 - 중앙 첫 카드 시작 */}
      {showLeftButton && (
        <Button
          variant="outline"
          size="icon"
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-lg hover:bg-gray-50 w-12 h-12 border-gray-200"
          onClick={handlePrev}
          aria-label="Go to Previous Page"
          title="Go to Previous Page"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      )}

      {/* 오른쪽 화살표 - 중앙 마지막 카드 끝 */}
      {showRightButton && (
        <Button
          variant="outline"
          size="icon"
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-lg hover:bg-gray-50 w-12 h-12 border-gray-200"
          onClick={handleNext}
          aria-label="Go to Next Page"
          title="Go to Next Page"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
