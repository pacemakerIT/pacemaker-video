import Image from 'next/image';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { CustomBadge } from '@/components/common/custom-badge';
import { itemCategoryLabel } from '@/constants/labels';
import { getOrderDisplayBySessionId, OrderDisplay } from '@/lib/order-display';
import { formatMoneyFromCents } from '@/lib/money';
import prisma from '@/lib/prisma';
import { resolveImageSrc } from '@/lib/utils';

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

function EmptyState({ hasSessionId }: { hasSessionId: boolean }) {
  return (
    <section className="flex-1 p-10 pt-20">
      <h1 className="mb-20 text-pace-xl font-bold text-pace-gray-700">
        장바구니
      </h1>
      <div className="flex flex-col gap-4 items-center justify-center text-center">
        <h2 className="text-[20px] font-medium text-pace-gray-700">
          결제 정보를 찾을 수 없습니다.
        </h2>
        <p className="text-pace-stone-500">
          {hasSessionId
            ? '현재 계정에서 확인할 수 있는 주문이 없습니다.'
            : 'Stripe 결제 세션 정보가 없습니다.'}
        </p>
        <Link
          href="/mypage/cart"
          className="mt-4 bg-pace-orange-800 px-10 py-4 rounded-full text-pace-white-500 hover:bg-pace-orange-600"
        >
          장바구니로 돌아가기
        </Link>
      </div>
    </section>
  );
}

function OrderItems({ order }: { order: OrderDisplay }) {
  return (
    <div className="mt-20 space-y-4 text-[20px] text-pace-gray-500">
      {order.items.map((item, index) => {
        const imageSrc =
          resolveImageSrc({
            thumbnail: item.thumbnail,
            itemType: item.itemType
          }) || '/img/resume_lecture.jpeg';
        const category =
          item.category &&
          (itemCategoryLabel.en[item.category] ?? item.category);

        return (
          <div
            key={item.id}
            className={`flex items-center border-b p-4 !m-0 ${index === 0 ? 'border-t' : ''}`}
          >
            <div className="w-20 h-4 text-pace-sm text-center text-pace-stone-500 mx-6">
              {item.typeLabel}
            </div>
            <Image
              src={imageSrc}
              alt={item.title}
              width={160}
              height={106}
              className="w-40 h-[106px] rounded-lg object-cover"
            />
            <div className="ml-6">
              {category && (
                <CustomBadge
                  variant={category}
                  className="w-fit flex justify-center items-center py-2 px-3"
                >
                  {category}
                </CustomBadge>
              )}
              {item.startsAt && (
                <div className="text-pace-sm">
                  {item.startsAt.toISOString().slice(0, 10).replace(/-/g, '.')}
                </div>
              )}

              <div className="mt-2">{item.title}</div>
              <div className="mt-2 font-bold text-pace-gray-500 text-pace-lg">
                {formatMoneyFromCents(item.priceCents, order.currency)}
              </div>
            </div>
            <Link
              href={item.actionHref}
              className="min-w-[120px] p-4 text-center ml-auto bg-pace-orange-500 rounded-full text-pace-base text-pace-white-500 font-regular"
            >
              {item.actionLabel}
            </Link>
          </div>
        );
      })}
    </div>
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

  return (
    <section className="flex-1 p-10 pt-20">
      <h1 className="mb-20 text-pace-xl font-bold text-pace-gray-700">
        장바구니
      </h1>
      <div className="flex flex-col gap-4 items-center justify-center text-center">
        <Image
          src="/icons/check-icon.svg"
          alt="check icon"
          width={32}
          height={32}
        />
        <h2 className="text-[20px] font-medium text-pace-gray-700">
          {order.status === 'COMPLETED' ? '결제완료' : order.statusLabel}
        </h2>
        <p className="text-pace-stone-500">
          주문 정보가 접수되었습니다.
          <br />
          주문번호는 <span className="font-semibold">
            {order.orderNumber}
          </span>{' '}
          입니다.
        </p>
        <p className="text-pace-base font-semibold text-pace-gray-700">
          총 결제 금액:{' '}
          {formatMoneyFromCents(order.totalAmountCents, order.currency)}
        </p>
      </div>

      <div className="flex mt-6 gap-4 items-center justify-center text-center">
        <Link
          href="/mypage"
          className="bg-pace-orange-800 px-10 py-4 rounded-full text-pace-white-500 hover:bg-pace-orange-600"
        >
          강의 현황 보러가기
        </Link>
        <Link
          href="/mypage/purchases"
          className="border-2 border-pace-orange-600 px-10 py-4 rounded-full text-pace-orange-600 hover:bg-pace-ivory-500"
        >
          구매내역 보러가기
        </Link>
      </div>

      <OrderItems order={order} />
    </section>
  );
}
