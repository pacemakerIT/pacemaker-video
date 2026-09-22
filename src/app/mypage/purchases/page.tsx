import { auth } from '@clerk/nextjs/server';
import { ItemType, OrderStatus } from '@prisma/client';
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

const purchaseTypeLabels: Record<ItemType, string> = {
  VIDEO: 'Online course',
  COURSE: 'Online course',
  EBOOK: 'E-book',
  WORKSHOP: 'Workshop'
};

export default async function Purchases() {
  const orders = await getCurrentUserOrders();

  return (
    <section className="min-w-0 flex-1 border border-gray-100 bg-white p-6 shadow-card">
      <h1 className="font-headline text-[1.85rem] font-bold tracking-tight text-navy">
        Order History
      </h1>
      <div className="mt-4 border-t border-gray-200">
        {orders.length > 0 ? (
          orders.map((order) => (
            <PurchasesList
              key={order.id}
              orderNumber={order.orderNumber}
              items={order.items.map((item) => ({
                id: item.id,
                type: purchaseTypeLabels[item.itemType],
                title: item.title,
                priceCents: item.priceCents,
                quantity: item.quantity
              }))}
              amountCents={order.totalAmountCents}
              status={order.status}
              statusLabel={
                order.status === OrderStatus.REFUNDED ? 'Refunded' : 'Paid'
              }
              date={order.orderedAt.toISOString().split('T')[0]}
              currency={order.currency}
              payment={{
                subtotalCents: order.subtotalAmountCents,
                discountCents: order.discountAmountCents,
                taxCents: order.taxAmountCents,
                method: 'Credit card',
                installment: 'One-time payment',
                card: '-',
                totalCents: order.totalAmountCents,
                currency: order.currency
              }}
              receiptUrl={order.stripeReceiptUrl || order.stripeInvoiceUrl}
            />
          ))
        ) : (
          <p className="py-12 text-center text-body-text">
            You have no orders yet.
          </p>
        )}
      </div>
    </section>
  );
}
