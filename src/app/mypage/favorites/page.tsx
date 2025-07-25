'use client';

import { useMemo, useState } from 'react';
import BadgeHeader from '@/components/features/mypage/badge-header';
import MyPageCard from '@/components/features/mypage/my-page-card';
import { MyCard } from '@/types/my-card';

const cards = [
  {
    id: '1',
    itemId: '4e8wv1z7tl',
    title: 'UX Design Fundamentals',
    price: 12.43,
    description:
      '자소서를 위한 스펙이 무엇인지와, 스펙을 쌓기 위하여 어떻게 정보를 구해야 할지 도와드릴게요.',
    category: 'Marketing',
    type: '워크샵'
  },
  {
    id: '2',
    itemId: '4e8wv1z7tl',
    title: 'UX Design Fundamentals',
    price: 15.99,
    description:
      '2~30대의 다양한 선택지를 두루 경험한 제가, 취준 일변도가 아니라 다양한 분야에서 쓰일 수 있는 스펙 쌓기부터 각종 자소서 작성 및 면접 준비까지 차근차근 준비해나가실 수 있도록 도와드리겠습니다.',
    category: 'Interview',
    type: '온라인 강의'
  },
  {
    id: '3',
    itemId: '4e8wv1z7tl',
    title: 'Test3',
    price: 9.99,
    description: 'test3',
    category: 'Resume',
    type: '온라인 강의'
  },
  {
    id: '4',
    itemId: '4e8wv1z7tl',
    title: 'TEST',
    price: 9.99,
    description: 'test3',
    category: 'Interview',
    type: '온라인 강의'
  },
  {
    id: '5',
    itemId: '4e8wv1z7tl',
    title: 'Test3',
    price: 9.99,
    description: 'test3',
    category: 'Resume',
    type: '온라인 강의'
  },
  {
    id: '6',
    itemId: '4e8wv1z7tl',
    title: 'Test3',
    price: 9.99,
    description: 'test3',
    category: 'Marketing',
    type: '전자책'
  }
];

export default function Favorites() {
  const type = useMemo(() => ['전체', '온라인 강의', '전자책', '워크샵'], []);
  const [currentType, setCurrentType] = useState<string>('전체');
  const [allCards] = useState<MyCard[]>(cards);

  const currentCards = useMemo(() => {
    if (currentType === '전체') {
      return allCards;
    }
    return allCards.filter((card) => card.type === currentType);
  }, [currentType, allCards]);

  if (!allCards || allCards.length === 0) {
    return <div>강의가 없습니다.</div>;
  }

  return (
    <section className="flex-1 p-10 pt-20">
      <h1 className="text-pace-xl font-bold text-pace-gray-700">내 찜목록</h1>
      <BadgeHeader
        category={type}
        currentCategory={currentType}
        setCurrentCategory={setCurrentType}
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
          />
        ))}
      </div>
    </section>
  );
}
