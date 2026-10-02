'use client';

import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';
import { CartItem } from '@/types/my-card';
import { Checkbox } from '@/components/ui/checkbox';
import { useCartContext } from '@/app/context/cart-context';
import { resolveImageSrc } from '@/lib/utils';
import { amountToCents, formatMoneyFromCents } from '@/lib/money';
import { CartCategory, cartProductHref, cartTypeLabel } from './cart-product';

interface CartListProps {
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

const checkboxClass =
  'h-4 w-4 rounded border-gray-300 data-[state=checked]:border-orange data-[state=checked]:bg-orange data-[state=checked]:text-white sm:h-5 sm:w-5';

export default function CartList({ cartItems, setCartItems }: CartListProps) {
  const { removeFromCart } = useCartContext();
  const selectedCount = cartItems.filter((item) => item.selected).length;

  return (
    <section aria-labelledby="cart-heading">
      <h1
        id="cart-heading"
        className="mb-6 font-headline text-3xl font-extrabold text-navy"
      >
        Cart
      </h1>
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <label className="flex cursor-pointer items-center gap-1.5 font-headline text-xs font-semibold text-navy sm:gap-3 sm:text-sm">
          <Checkbox
            aria-label="Select all"
            className={checkboxClass}
            disabled={!cartItems.length}
            checked={selectedCount === cartItems.length && cartItems.length > 0}
            onCheckedChange={(checked) =>
              setCartItems((items) =>
                items.map((item) => ({ ...item, selected: checked === true }))
              )
            }
          />
          Select all
        </label>
        <button
          type="button"
          disabled={!selectedCount}
          onClick={() =>
            removeFromCart(
              cartItems
                .filter((item) => item.selected)
                .map((item) => item.itemId)
            )
          }
          className="shrink-0 rounded-2xl border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-500 transition-colors hover:border-orange hover:text-orange disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:py-2 sm:text-sm"
        >
          Remove selected
        </button>
      </div>
      {cartItems.length ? (
        <div className="mt-6 space-y-4">
          {cartItems.map((item) => (
            <article
              key={`${item.type}-${item.itemId}`}
              className="flex flex-col items-start justify-between gap-3 border border-gray-100 bg-white p-3 shadow-[0_10px_30px_rgba(0,38,59,0.08)] sm:flex-row sm:items-center sm:gap-4 sm:p-4"
            >
              <div className="flex w-full min-w-0 items-center gap-3 sm:flex-1 sm:gap-4">
                <div className="flex w-[50px] min-w-[50px] shrink-0 flex-col items-center gap-1.5 sm:w-[70px] sm:min-w-[70px]">
                  <Checkbox
                    aria-label={`Select ${item.title}`}
                    className={checkboxClass}
                    checked={!!item.selected}
                    onCheckedChange={(checked) =>
                      setCartItems((items) =>
                        items.map((entry) =>
                          entry.itemId === item.itemId &&
                          entry.type === item.type
                            ? { ...entry, selected: checked === true }
                            : entry
                        )
                      )
                    }
                  />
                  <span className="w-full break-words text-center text-[8px] font-bold uppercase leading-tight tracking-wider text-gray-400 sm:text-[10px]">
                    {cartTypeLabel(item.type)}
                  </span>
                </div>
                <Link
                  href={cartProductHref(item.type, item.itemId)}
                  aria-label={`View ${item.title}`}
                  className="shrink-0 rounded-sm transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
                >
                  <Image
                    src={
                      resolveImageSrc({ thumbnail: item.thumbnail }) ||
                      '/img/resume_lecture.jpeg'
                    }
                    alt={item.title}
                    width={96}
                    height={64}
                    className="h-12 w-16 shrink-0 border border-gray-100 object-cover sm:h-16 sm:w-24"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="mb-1">
                    {item.date ? (
                      <span className="text-[9px] font-semibold text-gray-400 sm:text-[10px]">
                        {item.date.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    ) : (
                      <CartCategory category={item.category} />
                    )}
                  </div>
                  <h2 className="line-clamp-2 font-headline text-xs font-bold leading-tight text-navy sm:text-base">
                    <Link
                      href={cartProductHref(item.type, item.itemId)}
                      className="rounded-sm hover:text-orange hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
                    >
                      {item.title}
                    </Link>
                  </h2>
                </div>
              </div>
              <div className="flex w-full shrink-0 items-center justify-between gap-6 border-t border-gray-100 pl-[62px] pt-3 sm:w-auto sm:justify-end sm:border-0 sm:pl-0 sm:pt-0">
                <span className="text-lg font-extrabold text-navy sm:text-xl">
                  {formatMoneyFromCents(amountToCents(Number(item.price) || 0))}
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${item.title} from cart`}
                  onClick={() => removeFromCart([item.itemId])}
                  className="p-1 text-gray-400 transition-colors hover:text-orange"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 border border-gray-100 bg-white px-6 py-12 text-center shadow-[0_10px_30px_rgba(0,38,59,0.08)]">
          <p className="mb-4 text-body-text">Your cart is empty.</p>
          <Link
            href="/courses"
            className="font-semibold text-orange hover:underline"
          >
            Explore courses
          </Link>
        </div>
      )}
    </section>
  );
}
