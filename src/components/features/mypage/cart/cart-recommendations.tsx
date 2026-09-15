'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { ItemType } from '@prisma/client';
import { useCartContext } from '@/app/context/cart-context';
import { useFavoriteContext } from '@/app/context/favorite-context';
import { resolveImageSrc } from '@/lib/utils';
import { amountToCents, formatMoneyFromCents } from '@/lib/money';
import { CartCategory, cartTypeLabel } from './cart-product';

type Recommendation = {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  category: string | null;
  thumbnail: string | null;
  type: ItemType;
};

export default function CartRecommendations({
  items
}: {
  items: Recommendation[];
}) {
  const { cart, addToCart } = useCartContext();
  const { favorites, addFavorite, removeFavorite } = useFavoriteContext();
  const recommendations = items
    .filter(
      (item) =>
        !cart.some(
          (entry) => entry.itemId === item.id && entry.itemType === item.type
        )
    )
    .slice(0, 3);
  if (!recommendations.length) return null;
  return (
    <section className="pt-8" aria-labelledby="cart-recommendations">
      <h2
        id="cart-recommendations"
        className="mb-6 font-headline text-xl font-bold text-navy"
      >
        You Might Also Like
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {recommendations.map((item) => {
          const liked = favorites.some(
            (entry) => entry.itemId === item.id && entry.itemType === item.type
          );
          const href = `/${item.type === ItemType.EBOOK ? 'ebooks' : 'courses'}/${item.id}`;
          return (
            <article
              key={`${item.type}-${item.id}`}
              className="pm-card-lift flex flex-col overflow-hidden border border-gray-100 bg-white shadow-[0_10px_30px_rgba(0,38,59,0.08)]"
            >
              <div className="relative h-[180px] bg-navy/5">
                <Link href={href} aria-label={item.title}>
                  <Image
                    src={
                      resolveImageSrc({ thumbnail: item.thumbnail }) ||
                      '/img/resume_lecture.jpeg'
                    }
                    alt={item.title}
                    fill
                    sizes="(min-width: 1024px) 270px, (min-width: 768px) 33vw, 100vw"
                    className="object-cover"
                  />
                </Link>
                <div className="absolute left-4 top-6">
                  <CartCategory category={item.category} />
                </div>
                <button
                  type="button"
                  aria-label={`${liked ? 'Remove from' : 'Add to'} wishlist: ${item.title}`}
                  aria-pressed={liked}
                  onClick={() =>
                    liked
                      ? removeFavorite(item.id, item.type)
                      : addFavorite(item.id, item.type)
                  }
                  className={`favorite-heart absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-500 ease-out hover:scale-110 ${liked ? 'favorite-heart--liked' : ''}`}
                >
                  <span className="material-symbols-outlined text-xl leading-none">
                    favorite
                  </span>
                </button>
              </div>
              <Link href={href} className="flex-1 p-5">
                <p className="mb-1 text-[10px] font-semibold text-[#ff6b3d]">
                  {cartTypeLabel(item.type)}
                </p>
                <div className="mb-2 flex items-start justify-between gap-3">
                  <h3 className="line-clamp-2 font-headline text-sm font-bold leading-tight text-navy">
                    {item.title}
                  </h3>
                  <span className="shrink-0 text-base font-extrabold text-navy">
                    {formatMoneyFromCents(amountToCents(item.price || 0))}
                  </span>
                </div>
                <p className="mb-4 line-clamp-3 text-xs leading-relaxed text-body-text">
                  {item.description}
                </p>
              </Link>
              <div className="mt-auto flex justify-center border-t border-gray-100 px-5 py-4">
                <button
                  type="button"
                  onClick={() => addToCart(item.id, item.type)}
                  className="flex items-center gap-2 font-headline text-xs font-bold text-orange transition-colors hover:text-orange-hover"
                >
                  <ShoppingCart className="h-[18px] w-[18px]" />
                  Add to cart
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
