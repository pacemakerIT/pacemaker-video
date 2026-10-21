import Image from 'next/image';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { Check, Clock3, CircleAlert } from 'lucide-react';
import {
  CartCategory,
  cartTypeLabel
} from '@/components/features/mypage/cart/cart-product';
import { itemCategoryLabel } from '@/constants/labels';
import { getOrderDisplayBySessionId, OrderDisplay } from '@/lib/order-display';
import { formatMoneyFromCents } from '@/lib/money';
import prisma from '@/lib/prisma';
import { cn, resolveImageSrc } from '@/lib/utils';

type PaymentSuccessProps = {
  searchParams: Promise<{
    session_id?: string | string[];
  }>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function getOrder(sessionId: string | undefined) {
  if (!sessionId) return null;

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return null;

  const currentUser = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true }
  });

  if (!currentUser) return null;

  return getOrderDisplayBySessionId(sessionId, currentUser.id);
}

const primaryButton =
  'inline-flex w-full items-center justify-center rounded-full bg-orange px-6 py-2.5 font-headline text-xs font-bold text-white shadow-[0_4px_14px_rgba(255,79,2,0.25)] transition-colors hover:bg-orange-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange sm:w-auto sm:text-sm';
const secondaryButton =
  'inline-flex w-full items-center justify-center rounded-full border border-orange bg-white px-6 py-2.5 font-headline text-xs font-bold text-orange transition-colors hover:bg-orange/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange sm:w-auto sm:text-sm';
const summaryClass =
  'mb-6 flex w-full flex-col items-center border border-gray-100 bg-white p-5 text-center shadow-card sm:mb-8 sm:p-12';

function PageTitle() {
  return (
    <h1 className="mb-4 font-headline text-2xl font-extrabold text-navy sm:mb-6 sm:text-3xl">
      Cart
    </h1>
  );
}

function EmptyState({ hasSessionId }: { hasSessionId: boolean }) {
  return (
    <section className="min-w-0 flex-1 font-body text-body-text">
      <PageTitle />
      <div className={summaryClass}>
        <CircleAlert aria-hidden="true" className="mb-4 h-12 w-12 text-navy" />
        <h2 className="mb-3 font-headline text-lg font-bold text-navy sm:text-2xl">
          Payment information unavailable
        </h2>
        <p className="mb-6 max-w-md text-sm leading-relaxed text-gray-500">
          {hasSessionId
            ? 'We could not find an order for your account. If you just paid, refresh this page in a moment or check your order history.'
            : 'No payment session was provided. You can check your purchases in your order history.'}
        </p>
        <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:gap-3">
          <Link href="/mypage/cart" className={primaryButton}>
            Back to cart
          </Link>
          <Link href="/mypage/purchases" className={secondaryButton}>
            View order history
          </Link>
        </div>
      </div>
    </section>
  );
}

function OrderItems({ order }: { order: OrderDisplay }) {
  const actionLabels = {
    COURSE: 'Start course',
    VIDEO: 'Start course',
    EBOOK: 'Read e-book',
    WORKSHOP: 'View workshop'
  };

  return (
    <ul aria-label="Purchased items" className="space-y-3 sm:space-y-4">
      {order.items.map((item) => {
        const imageSrc =
          resolveImageSrc({
            thumbnail: item.thumbnail,
            itemType: item.itemType
          }) || '/img/resume_lecture.jpeg';
        const category =
          item.category &&
          (itemCategoryLabel.en[item.category] ?? item.category);

        return (
          <li
            key={item.id}
            className="flex flex-col gap-3 border border-gray-100 bg-white p-3.5 shadow-card sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
              <span className="w-[50px] shrink-0 text-center text-[9px] font-medium leading-tight text-gray-400 sm:w-16 sm:text-xs">
                {cartTypeLabel(item.itemType)}
              </span>
              <Image
                src={imageSrc}
                alt={item.title}
                width={112}
                height={72}
                sizes="(min-width: 640px) 112px, 64px"
                className="h-12 w-16 shrink-0 border border-gray-100 object-cover sm:h-[72px] sm:w-28"
              />
              <div className="min-w-0 flex-1">
                {item.startsAt ? (
                  <p className="mb-1 text-[9px] font-semibold text-gray-400 sm:text-[11px]">
                    {item.startsAt
                      .toISOString()
                      .slice(0, 10)
                      .replace(/-/g, '.')}
                  </p>
                ) : category ? (
                  <div className="mb-1">
                    <CartCategory category={category} />
                  </div>
                ) : null}
                <h3 className="line-clamp-2 font-headline text-xs font-bold leading-snug text-navy sm:text-base">
                  {item.title}
                </h3>
                {item.quantity > 1 && (
                  <p className="mt-1 text-xs text-gray-500">
                    Quantity: {item.quantity}
                  </p>
                )}
              </div>
            </div>
            <div className="flex w-full shrink-0 items-center justify-between gap-3 border-t border-gray-100 pt-2.5 sm:w-auto sm:flex-col sm:items-end sm:justify-center sm:border-0 sm:pt-0 xl:flex-row xl:items-center xl:gap-6">
              <span className="text-sm font-extrabold text-navy sm:text-lg">
                {formatMoneyFromCents(
                  item.priceCents * item.quantity,
                  order.currency
                )}
              </span>
              <Link
                href={item.actionHref}
                className={cn(primaryButton, 'w-auto shrink-0 px-4 sm:px-6')}
              >
                {order.status === 'COMPLETED' &&
                item.actionHref !== '/mypage/purchases'
                  ? actionLabels[item.itemType]
                  : 'View details'}
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default async function PaymentSuccess({
  searchParams
}: PaymentSuccessProps) {
  const params = await searchParams;
  const sessionId = firstParam(params.session_id);
  const order = await getOrder(sessionId);

  if (!order) {
    return <EmptyState hasSessionId={Boolean(sessionId)} />;
  }

  const isFinalizedOrder = order.status === 'COMPLETED';
  const statusTitles = {
    COMPLETED: 'Payment Complete',
    PENDING: 'Payment confirmation pending',
    FAILED: 'Payment unsuccessful',
    CANCELLED: 'Payment cancelled',
    REFUNDED: 'Payment refunded'
  };
  const statusDescriptions = {
    COMPLETED: 'Your payment has been completed.',
    PENDING:
      'We are confirming your payment. Please check your order history shortly.',
    FAILED:
      'Your payment could not be completed. Please return to your cart to try again.',
    CANCELLED: 'This payment was cancelled.',
    REFUNDED: 'This order has been refunded.'
  };
  const StatusIcon = isFinalizedOrder
    ? Check
    : order.status === 'PENDING'
      ? Clock3
      : CircleAlert;

  return (
    <section className="min-w-0 flex-1 font-body text-body-text">
      <PageTitle />
      <div className={summaryClass}>
        <div className="mb-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-navy text-navy sm:mb-4 sm:h-12 sm:w-12">
          <StatusIcon
            aria-hidden="true"
            className="h-5 w-5 sm:h-6 sm:w-6"
            strokeWidth={2.5}
          />
        </div>
        <h2 className="mb-2 font-headline text-lg font-bold text-navy sm:mb-3 sm:text-2xl">
          {statusTitles[order.status]}
        </h2>
        <p className="max-w-md text-xs font-medium leading-relaxed text-gray-500 sm:text-sm">
          {statusDescriptions[order.status]}
          <br />
          Your order number is{' '}
          <span className="break-all font-bold text-navy">
            {order.orderNumber.replace(/^No\.\s*/, '')}
          </span>
          .
        </p>
        <p className="mt-3 text-sm font-semibold text-navy">
          {isFinalizedOrder ? 'Total paid' : 'Order total'}:{' '}
          {formatMoneyFromCents(order.totalAmountCents, order.currency)}
        </p>
        {order.status === 'PENDING' && (
          <p className="mt-2 max-w-md text-xs text-gray-500">
            Discounts and the final charged amount will appear once your payment
            is confirmed.
          </p>
        )}
        <div className="mt-5 flex w-full flex-col items-center justify-center gap-2.5 sm:mt-6 sm:w-auto sm:flex-row sm:gap-3">
          <Link
            href={isFinalizedOrder ? '/mypage' : '/mypage/cart'}
            className={primaryButton}
          >
            {isFinalizedOrder ? 'View my courses' : 'Back to cart'}
          </Link>
          <Link href="/mypage/purchases" className={secondaryButton}>
            View order history
          </Link>
        </div>
      </div>
      <OrderItems order={order} />
    </section>
  );
}
