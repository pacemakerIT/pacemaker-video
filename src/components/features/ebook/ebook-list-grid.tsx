'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import CardContainer from '@/components/common/card-container';
import EBookHeader from '@/components/features/ebook/ebook-header';
import { OnlineCards } from '@/types/online'; // 전자책 타입 생기면 교체
import { toast } from 'sonner';
import { ItemType } from '@prisma/client';

export default function EbookListGrid() {
  // 전자책 카테고리 (UI 상단 버튼) - 영문 키로 유지
  const category = useMemo(
    () => [
      'TOTAL',
      'MARKETING',
      'IT',
      'DESIGN',
      'PUBLIC',
      'ACCOUNTING',
      'SERVICE'
    ],
    []
  );

  const [currentCategory, setCurrentCategory] = useState<string>('TOTAL'); // 현재 카테고리 상태
  const [sortBy, setSortBy] = useState<string>('Total'); // 정렬 기준
  const [allCards, setAllCards] = useState<OnlineCards[]>([]); // 전체 전자책 목록
  const [loading, setLoading] = useState(true); // 로딩 상태

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

  // TO-DO : 정렬 반영 (영문 기반 처리)
  // 카테고리만 반영 (영문 기반 처리, 대소문자 통일)
  const currentCards = useMemo(() => {
    const filtered =
      currentCategory === 'TOTAL'
        ? allCards
        : allCards.filter(
            (card) =>
              card.category.toUpperCase() === currentCategory.toUpperCase()
          );

    return filtered;
  }, [allCards, currentCategory]);

  return (
    <div className="w-[1200px] mx-auto flex flex-col items-center justify-center">
      {loading ? (
        <p className="p-4 text-pace-base">📡 Loading e-books...</p>
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
            itemType={ItemType.EBOOK}
          />
        </>
      )}
    </div>
  );
}
