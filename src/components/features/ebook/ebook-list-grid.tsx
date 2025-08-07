'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import CardContainer from '@/components/common/card-container';
import EBookHeader from '@/components/features/ebook/ebook-header';
import { OnlineCards } from '@/types/online'; // 전자책 타입 생기면 교체
import { toast } from 'sonner';
import { ItemType } from '@prisma/client';

export default function EbookListGrid() {
  // 전자책 카테고리 (UI 상단 버튼)
  const category = useMemo(
    () => ['TOTAL', '마케팅', 'IT', '디자인', '북미 공무원', '재무/회계'],
    []
  );

  const [currentCategory, setCurrentCategory] = useState<string>('TOTAL');
  const [sortBy, setSortBy] = useState<string>('Total'); // 정렬 기준
  const [allCards, setAllCards] = useState<OnlineCards[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEbooks = useCallback(async () => {
    try {
      const res = await fetch('/api/ebooks'); // 전자책 API 엔드포인트
      if (res.ok) {
        const data = await res.json();
        setAllCards(data);
      } else {
        toast('Failed to fetch ebooks');
      }
    } catch (error) {
      toast(`Failed to connect server: ${error}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEbooks();
  }, [fetchEbooks]);

  const currentCards = useMemo(() => {
    if (currentCategory === 'TOTAL') {
      return allCards;
    }
    return allCards.filter((card) => card.category === currentCategory);
  }, [currentCategory, allCards]);

  return (
    <div className="w-[1200px] mx-auto flex flex-col items-center justify-center">
      {loading ? (
        <p className="p-4">📡 전자책 불러오는 중...</p>
      ) : (
        <>
          {/* 상단 카테고리 + 정렬 */}
          <EBookHeader
            category={category}
            currentCategory={currentCategory}
            setCurrentCategory={setCurrentCategory}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />

          {/* 카드 리스트 (Grid) */}
          <CardContainer
            layout={'grid'}
            cards={currentCards}
            itemType={ItemType.DOCUMENT}
          />
        </>
      )}
    </div>
  );
}
