import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import {
  getOrderDisplayById,
  OrderDisplayItem,
  orderStatusLabels
} from '@/lib/order-display';
import { formatMoneyFromCents } from '@/lib/money';
import prisma from '@/lib/prisma';

type PaymentCancelProps = {
  searchParams: Promise<{
    order_id?: string | string[];
  }>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function getCancelledOrder(orderId: string | undefined) {
  if (!orderId) return null;

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return null;

  const currentUser = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true }
  });

  if (!currentUser) return null;

  return getOrderDisplayById(orderId, currentUser.id);
}

function ItemSummary({ item }: { item: OrderDisplayItem }) {
  return (
    <li className="flex justify-between gap-4 text-pace-base text-pace-gray-700">
      <span>
        {item.typeLabel} · {item.title}
      </span>
      <span>{formatMoneyFromCents(item.priceCents)}</span>
    </li>
  );
}

export default async function PaymentCancel({
  searchParams
}: PaymentCancelProps) {
  const params = await searchParams;
  const orderId = firstParam(params.order_id);
  const order = await getCancelledOrder(orderId);

  return (
    <section className="mx-auto flex min-h-[520px] max-w-[720px] flex-col items-center justify-center px-6 py-20 text-center">
      <h1 className="text-[28px] font-bold text-pace-gray-700">
        결제가 완료되지 않았습니다.
      </h1>
      <p className="mt-4 text-pace-base text-pace-stone-500">
        Stripe Checkout이 취소되었습니다. 장바구니에서 다시 결제를 진행할 수
        있습니다.
      </p>

      {order && (
        <div className="mt-10 w-full rounded-lg border border-pace-gray-100 p-6 text-left">
          <div className="flex justify-between text-pace-base text-pace-stone-500">
            <span>주문번호</span>
            <span>{order.orderNumber}</span>
          </div>
          <div className="mt-2 flex justify-between text-pace-base text-pace-stone-500">
            <span>주문상태</span>
            <span>{orderStatusLabels[order.status]}</span>
          </div>
          <ul className="mt-6 space-y-2 border-t border-pace-gray-100 pt-6">
            {order.items.map((item) => (
              <ItemSummary key={item.id} item={item} />
            ))}
          </ul>
          <div className="mt-6 flex justify-between border-t border-pace-gray-100 pt-6 text-[20px] font-semibold text-pace-gray-700">
            <span>주문 기준 금액</span>
            <span>
              {formatMoneyFromCents(order.totalAmountCents, order.currency)}
            </span>
          </div>
          <p className="mt-3 text-right text-pace-sm text-pace-stone-500">
            프로모션 할인 및 최종 청구 금액은 Stripe Checkout에서 확정됩니다.
          </p>
        </div>
      )}

      <div className="mt-10 flex gap-4">
        <Link
          href="/mypage/cart"
          className="bg-pace-orange-800 px-10 py-4 rounded-full text-pace-white-500 hover:bg-pace-orange-600"
        >
          장바구니로 돌아가기
        </Link>
        <Link
          href="/"
          className="border-2 border-pace-orange-600 px-10 py-4 rounded-full text-pace-orange-600 hover:bg-pace-ivory-500"
        >
          홈으로 가기
        </Link>
      </div>
    </section>
  );
}
