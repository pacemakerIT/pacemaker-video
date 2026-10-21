'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ItemType } from '@prisma/client';
import { Heart, ShoppingCart } from 'lucide-react';
import { Favorite, useFavoriteContext } from '@/app/context/favorite-context';
import { useCartContext } from '@/app/context/cart-context';
import { amountToCents, formatMoneyFromCents } from '@/lib/money';
import { resolveImageSrc } from '@/lib/utils';

type Filter = 'ALL' | 'COURSE' | 'EBOOK' | 'WORKSHOP';
const filters: { label: string; value: Filter }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Online courses', value: 'COURSE' },
  { label: 'E-books', value: 'EBOOK' },
  { label: 'Workshops', value: 'WORKSHOP' }
];

function matches(item: Favorite, filter: Filter) {
  if (filter === 'ALL') return true;
  if (filter === 'COURSE')
    return (
      item.itemType === ItemType.COURSE || item.itemType === ItemType.VIDEO
    );
  return item.itemType === filter;
}

function itemHref(item: Favorite) {
  if (item.itemType === ItemType.EBOOK) return `/ebooks/${item.id}`;
  if (item.itemType === ItemType.WORKSHOP) return `/workshops/${item.itemId}`;
  if (item.itemType === ItemType.COURSE) return `/courses/${item.itemId}`;
  return '/courses';
}

function itemTypeLabel(type: ItemType) {
  if (type === ItemType.EBOOK) return 'E-books';
  if (type === ItemType.WORKSHOP) return 'Workshops';
  return 'Online courses';
}

function categoryColor(category: string | null) {
  const colors: Record<string, string> = {
    INTERVIEW: 'bg-[#36a6f7]',
    MARKETING: 'bg-[#ff7e54]',
    RESUME: 'bg-pace-purple-500',
    NETWORKING: 'bg-amber-500',
    DESIGN: 'bg-pace-pink-500',
    IT: 'bg-pace-blue-700'
  };
  return colors[category?.toUpperCase() || ''] || 'bg-teal';
}

export default function Favorites() {
  const [filter, setFilter] = useState<Filter>('ALL');
  const { favorites, removeFavorite } = useFavoriteContext();
  const { cart, addToCart } = useCartContext();
  const visibleItems = useMemo(
    () => favorites.filter((item) => matches(item, filter)),
    [favorites, filter]
  );

  return (
    <section className="min-w-0 flex-1">
      <h1 className="mb-6 font-headline text-[1.85rem] font-bold tracking-tight text-navy">
        My Wishlist
      </h1>
      <div className="mb-8 flex flex-wrap gap-3" aria-label="Wishlist filters">
        {filters.map(({ label, value }) => {
          const active = filter === value;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(value)}
              className={`inline-flex h-8 shrink-0 items-center justify-center whitespace-nowrap rounded-xl border px-4 font-headline text-xs transition-all md:h-10 md:min-w-[110px] md:rounded-2xl md:px-6 md:text-sm ${active ? 'border-orange bg-orange/10 font-bold text-orange shadow-[0_10px_25px_-5px_rgba(255,79,2,0.12)]' : 'border-[#d0d5dd] bg-white font-medium text-[#667085] hover:border-orange hover:bg-orange/5 hover:text-orange'}`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {visibleItems.length ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleItems.map((item) => {
            const href = itemHref(item);
            const inCart = cart.some(
              (entry) =>
                entry.itemId === item.itemId && entry.itemType === item.itemType
            );
            return (
              <article
                key={`${item.itemType}-${item.itemId}`}
                className="pm-card-lift group flex flex-col justify-between overflow-hidden border border-gray-100 bg-white shadow-card"
              >
                <div>
                  <div className="relative h-[180px] overflow-hidden bg-navy/5">
                    <Link href={href} aria-label={`View ${item.title}`}>
                      <Image
                        src={
                          resolveImageSrc({ thumbnail: item.thumbnail }) ||
                          '/img/resume_lecture.jpeg'
                        }
                        alt={item.title}
                        fill
                        sizes="(min-width: 1024px) 280px, (min-width: 768px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>
                    <button
                      type="button"
                      aria-label={`Remove ${item.title} from wishlist`}
                      onClick={() => removeFavorite(item.itemId, item.itemType)}
                      className="favorite-heart favorite-heart--liked absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-500 ease-out hover:scale-110"
                    >
                      <span className="material-symbols-outlined text-xl leading-none">
                        favorite
                      </span>
                    </button>
                    {item.category && (
                      <span
                        className={`absolute left-6 top-6 z-10 inline-flex h-[22px] items-center rounded-full px-3 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm ${categoryColor(item.category)}`}
                      >
                        {item.category.replaceAll('_', ' ')}
                      </span>
                    )}
                  </div>
                  <Link href={href} className="block p-5">
                    <p className="mb-1 text-[10px] font-semibold text-[#ff6b3d]">
                      {itemTypeLabel(item.itemType)}
                    </p>
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <h2 className="line-clamp-2 font-headline text-sm font-bold leading-tight text-navy">
                        {item.title}
                      </h2>
                      <span className="shrink-0 text-base font-extrabold text-navy">
                        {formatMoneyFromCents(
                          amountToCents(Number(item.price) || 0)
                        )}
                      </span>
                    </div>
                    <p className="line-clamp-3 text-xs leading-relaxed text-body-text">
                      {item.description}
                    </p>
                  </Link>
                </div>
                <div className="mt-auto flex justify-center border-t border-gray-100 px-5 py-4">
                  <button
                    type="button"
                    disabled={inCart}
                    onClick={() => addToCart(item.itemId, item.itemType)}
                    className="flex items-center gap-2 font-headline text-xs font-bold text-orange transition-colors hover:text-orange-hover disabled:cursor-default disabled:text-gray-400"
                  >
                    <ShoppingCart className="h-[18px] w-[18px]" />
                    {inCart ? 'In cart' : 'Add to cart'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="flex min-h-72 flex-col items-center justify-center border border-gray-100 bg-white px-6 text-center shadow-card">
          <Heart className="mb-4 h-10 w-10 text-gray-300" />
          <h2 className="font-headline text-lg font-bold text-navy">
            No saved items yet
          </h2>
          <p className="mt-2 text-sm text-body-text">
            Save courses, e-books, and workshops to find them here.
          </p>
        </div>
      )}
    </section>
  );
}
