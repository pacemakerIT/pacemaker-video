'use client';
import * as React from 'react';
import Card from './Card';
import { OnlineCards } from '@/types/online';
import ArrowRight from '../../public/icons/arrow_right_circle.svg';
import ArrowLeft from '../../public/icons/arrow_left_circle.svg';
import Image from 'next/image';

interface CardContainerProps {
  layout: 'grid' | 'horizontal';
  cards: OnlineCards[];
}

export default function CardContainer({ layout, cards }: CardContainerProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const cardWidth = 588; // Card 컴포넌트의 width 값
  const gap = 16; // gap-4 = 16px
  const cardsPerPage = currentIndex === 0 ? 1.5 : 2; // 추가

  const handlePrev = () => {
    if (currentIndex > 0) {
      const newIndex = Math.max(currentIndex - cardsPerPage, 0);
      setCurrentIndex(newIndex);
      if (containerRef.current) {
        containerRef.current.scrollTo({
          left:
            currentIndex === 0
              ? newIndex * cardWidth
              : newIndex * (cardWidth - gap),
          behavior: 'smooth'
        });
      }
    }
  };

  const handleNext = () => {
    const maxIndex = Math.max(0, cards.length - cardsPerPage);
    if (currentIndex < maxIndex) {
      const newIndex = Math.min(currentIndex + cardsPerPage, maxIndex);
      setCurrentIndex(newIndex);
      if (containerRef.current) {
        containerRef.current.scrollTo({
          left:
            currentIndex === 0
              ? newIndex * cardWidth
              : newIndex * (cardWidth + gap),
          behavior: 'smooth'
        });
      }
    }
  };

  // horizontal layout에서 마지막 페이지 전(오른쪽 화살표가 사라지기 직전)에 빈 카드 추가
  function getVisibleCards() {
    if (layout !== 'horizontal') return cards;
    const start = currentIndex;
    const end = Math.min(currentIndex + 4, cards.length);
    const visible = cards.slice(start, end);
    // 마지막 페이지 전(오른쪽 화살표가 마지막으로 보이는 페이지) 조건
    const isLastArrowPage =
      end < cards.length && // 아직 마지막 카드가 아님
      end + 4 >= cards.length; // 다음 페이지가 마지막 페이지임
    if (isLastArrowPage && visible.length < 4) {
      const emptyCount = 4 - visible.length;
      return [
        ...visible,
        ...Array.from({ length: emptyCount }, (_, idx) => ({
          id: `empty-${idx}`,
          empty: true as const
        }))
      ];
    }
    return visible;
  }

  function isEmptyCard(
    card: OnlineCards | { id: string; empty: true }
  ): card is { id: string; empty: true } {
    return 'empty' in card && card.empty === true;
  }

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
          />
        ))}
      </div>
    );
  }

  return (
    <div
      data-testid={layout === 'horizontal' ? 'horizontal-container' : undefined}
      className={`relative flex w-screen ${currentIndex === 0 ? 'justify-end ' : 'justify-start'}`}
    >
      {/* 왼쪽 화살표 */}
      {currentIndex > 0 && (
        <button
          aria-label="previous"
          className="absolute top-[40%] z-10 left-[330px] cursor-pointer"
          onClick={handlePrev}
        >
          <Image src={ArrowLeft} width={63} height={63} alt={'이전'} />
        </button>
      )}

      {/* 카드 리스트: w-screen, 중앙 정렬 */}
      <div
        ref={containerRef}
        className={`relative flex gap-7 pb-4 overflow-hidden ${currentIndex === 0 ? ' w-[calc(100vw-360px)]' : ' w-screen'}`}
      >
        {getVisibleCards().map((card) => {
          if (isEmptyCard(card)) {
            return (
              <div
                key={card.id}
                className="flex-none"
                style={{ width: cardWidth }}
              />
            );
          } else {
            return (
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
                />
              </div>
            );
          }
        })}
      </div>

      {/* 오른쪽 화살표 */}
      {currentIndex < cards.length - cardsPerPage && (
        <button
          aria-label="next"
          className={`absolute top-[40%] z-10 right-[330px] cursor-pointer"`}
          onClick={handleNext}
        >
          <Image src={ArrowRight} width={63} height={63} alt={'이후'} />
        </button>
      )}
    </div>
  );
}
