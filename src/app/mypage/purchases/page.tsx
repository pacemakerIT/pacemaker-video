import { auth } from '@clerk/nextjs/server';
import { OrderStatus } from '@prisma/client';
import PurchasesList from '@/components/features/mypage/purchases/purchases-list';
import { getOrderDisplaysForUser } from '@/lib/order-display';
import prisma from '@/lib/prisma';

async function getCurrentUserOrders() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return [];

  const currentUser = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true }
  });

  if (!currentUser) return [];

  return getOrderDisplaysForUser(currentUser.id, [
    OrderStatus.COMPLETED,
    OrderStatus.REFUNDED
  ]);
}

export default async function Purchases() {
  const orders = await getCurrentUserOrders();

  return (
    <main className="mx-10 mt-20 mb-auto">
      <h1 className="text-pace-xl font-bold mb-6 text-pace-gray-700">
        구매내역
      </h1>
      {orders.length > 0 ? (
        orders.map((order, idx) => (
          <PurchasesList
            key={order.id}
            orderNumber={order.orderNumber}
            items={order.items.map((item) => ({
              id: item.id,
              type: item.typeLabel,
              title: item.title,
              priceCents: item.priceCents,
              quantity: item.quantity
            }))}
            amountCents={order.totalAmountCents}
            status={order.status}
            statusLabel={order.statusLabel}
            date={order.orderedAt.toISOString().split('T')[0]}
            currency={order.currency}
            payment={{
              subtotalCents: order.subtotalAmountCents,
              discountCents: order.discountAmountCents,
              taxCents: order.taxAmountCents,
              method: 'Stripe Checkout',
              installment: '-',
              card: '-',
              totalCents: order.totalAmountCents,
              currency: order.currency
            }}
            receiptUrl={order.stripeReceiptUrl || order.stripeInvoiceUrl}
            isFirst={idx === 0}
          />
        ))
      ) : (
        <p className="border-t border-pace-gray-700 py-10 text-pace-stone-500">
          구매내역이 없습니다.
        </p>
      )}
    </main>
  );
}
