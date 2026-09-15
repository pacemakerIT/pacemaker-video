'use client';

import { useMemo, useState } from 'react';
import { MyWorkshopCard } from '@/types/my-card';
import BadgeHeader from './my-account-badge-header';
import MyPageWorkshopCard from './my-page-workshop-card';

export default function MyWorkshopList({ cards }: { cards: MyWorkshopCard[] }) {
  const [filter, setFilter] = useState('All');
  const visibleCards = useMemo(() => {
    const now = new Date();
    if (filter === 'Upcoming') return cards.filter((card) => card.date >= now);
    if (filter === 'Completed') return cards.filter((card) => card.date < now);
    return cards;
  }, [cards, filter]);

  return (
    <section className="mb-12">
      <h2 className="mb-4 font-headline text-2xl font-bold tracking-tight text-[#00263B]">
        My Workshops
      </h2>
      <BadgeHeader
        category={['All', 'Upcoming', 'Completed']}
        currentCategory={filter}
        setCurrentCategory={setFilter}
      />
      {visibleCards.length ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleCards.map((card) => (
            <MyPageWorkshopCard key={card.id} {...card} />
          ))}
        </div>
      ) : (
        <p className="border-t border-gray-100 py-10 text-sm text-[#667085]">
          No workshops found.
        </p>
      )}
    </section>
  );
}
