'use client';

import { useMemo, useState } from 'react';
import { ItemType } from '@prisma/client';
import { MyCard } from '@/types/my-card';
import { useFavoriteContext } from '@/app/context/favorite-context';
import BadgeHeader from '@/components/features/mypage/badge-header';
import MyPageCard from '@/components/features/mypage/my-page-card';

export default function Favorites() {
  const type = useMemo(() => ['전체', '온라인 강의', '전자책', '워크샵'], []);
  type CurrentFilter = '전체' | '온라인 강의' | '전자책' | '워크샵';
  const [currentType, setCurrentType] = useState<CurrentFilter>('전체');
  const { favorites } = useFavoriteContext();
  const allCards = useMemo<MyCard[]>(
    () =>
      favorites.map((f) => ({
        id: f.id,
        itemId: f.itemId,
        title: f.title,
        price: f.price,
        description: f.description,
        category: f.category ?? '',
        type: f.itemType,
        like: f.like,
        date: f.startDate ? new Date(f.startDate) : undefined
      })),
    [favorites]
  );

  const currentCards = useMemo<MyCard[]>(
    () =>
      currentType === '전체'
        ? allCards
        : allCards.filter((c) => {
            if (currentType === '온라인 강의') return c.type === ItemType.VIDEO;
            if (currentType === '전자책') return c.type === ItemType.DOCUMENT;
            if (currentType === '워크샵') return c.type === ItemType.WORKSHOP;
            return true;
          }),
    [allCards, currentType]
  );

  return (
    <section className="flex-1 p-10 pt-20">
      <h1 className="text-pace-xl font-bold text-pace-gray-700">내 찜목록</h1>
      {!allCards || allCards.length === 0 ? (
        <div className="mt-10">찜한 강의가 없습니다.</div>
      ) : (
        <>
          <BadgeHeader
            category={type}
            currentCategory={currentType}
            setCurrentCategory={(c) => setCurrentType(c as CurrentFilter)}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCards?.map((card, index) => (
              <MyPageCard
                key={index}
                id={card.id}
                title={card.title}
                price={card.price}
                description={card.description}
                type={card.type}
                category={card.category}
                itemId={card.itemId}
                purchased={false}
                like={true}
                date={card.date}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
