import { ItemType, OrderStatus, Prisma } from '@prisma/client';
import prisma from './prisma';

type PrismaTx = Prisma.TransactionClient;
type OrderWithItems = Prisma.OrderGetPayload<{
  include: { items: true };
}>;

export type OrderDisplayItem = {
  id: string;
  itemId: string;
  itemType: ItemType;
  typeLabel: string;
  title: string;
  category: string | null;
  thumbnail: string | null;
  startsAt: Date | null;
  priceCents: number;
  quantity: number;
  actionHref: string;
  actionLabel: string;
};

export type OrderDisplay = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  statusLabel: string;
  orderedAt: Date;
  currency: string;
  subtotalAmountCents: number;
  discountAmountCents: number;
  taxAmountCents: number;
  totalAmountCents: number;
  stripeCheckoutSessionId: string | null;
  stripeReceiptUrl: string | null;
  stripeInvoiceUrl: string | null;
  items: OrderDisplayItem[];
};

export const orderStatusLabels: Record<OrderStatus, string> = {
  PENDING: '결제확인중',
  COMPLETED: '결제완료',
  FAILED: '결제실패',
  CANCELLED: '결제취소',
  REFUNDED: '환불완료'
};

export const orderItemTypeLabels: Record<ItemType, string> = {
  VIDEO: '온라인 강의',
  COURSE: '온라인 강의',
  EBOOK: '전자책',
  WORKSHOP: '워크샵'
};

function formatOrderNumber(id: string) {
  return `No. ${id.slice(0, 8).toUpperCase()}`;
}

function fallbackOrderItem(item: {
  id: string;
  itemId: string;
  itemType: ItemType;
  priceAtPurchaseCents: number;
  quantity: number;
}): OrderDisplayItem {
  return {
    id: item.id,
    itemId: item.itemId,
    itemType: item.itemType,
    typeLabel: orderItemTypeLabels[item.itemType],
    title: '구매 항목',
    category: null,
    thumbnail: null,
    startsAt: null,
    priceCents: item.priceAtPurchaseCents,
    quantity: item.quantity,
    actionHref: '/mypage/purchases',
    actionLabel: 'View detail'
  };
}

async function resolveOrderDisplayItem(
  tx: PrismaTx,
  item: OrderWithItems['items'][number]
): Promise<OrderDisplayItem> {
  const fallback = fallbackOrderItem(item);

  switch (item.itemType) {
    case ItemType.COURSE: {
      const course = await tx.course.findUnique({
        where: { id: item.itemId },
        select: {
          id: true,
          title: true,
          category: true,
          thumbnailUrl: true
        }
      });

      if (!course) return fallback;

      return {
        ...fallback,
        itemId: course.id,
        title: course.title || fallback.title,
        category: course.category,
        thumbnail: course.thumbnailUrl,
        actionHref: `/courses/${course.id}`,
        actionLabel: '수강하러 가기'
      };
    }
    case ItemType.EBOOK: {
      const ebook = await tx.ebook.findUnique({
        where: { id: item.itemId },
        select: {
          id: true,
          title: true,
          category: true,
          thumbnail: true
        }
      });

      if (!ebook) return fallback;

      return {
        ...fallback,
        itemId: ebook.id,
        title: ebook.title || fallback.title,
        category: ebook.category,
        thumbnail: ebook.thumbnail,
        actionHref: `/ebooks/${ebook.id}`,
        actionLabel: '전자책 보기'
      };
    }
    case ItemType.WORKSHOP: {
      const workshop = await tx.workshop.findUnique({
        where: { id: item.itemId },
        select: {
          id: true,
          title: true,
          category: true,
          thumbnail: true,
          startDate: true
        }
      });

      if (!workshop) return fallback;

      return {
        ...fallback,
        itemId: workshop.id,
        title: workshop.title,
        category: workshop.category,
        thumbnail: workshop.thumbnail,
        startsAt: workshop.startDate,
        actionHref: `/workshops/${workshop.id}`,
        actionLabel: 'View detail'
      };
    }
    case ItemType.VIDEO: {
      const video = await tx.video.findUnique({
        where: { id: item.itemId },
        select: {
          id: true,
          title: true,
          category: true,
          thumbnail: true
        }
      });

      if (!video) return fallback;

      return {
        ...fallback,
        itemId: video.id,
        title: video.title || fallback.title,
        category: video.category,
        thumbnail: video.thumbnail,
        actionHref: '/courses',
        actionLabel: '수강하러 가기'
      };
    }
    default:
      return fallback;
  }
}

async function toOrderDisplay(
  tx: PrismaTx,
  order: OrderWithItems
): Promise<OrderDisplay> {
  const items = await Promise.all(
    order.items.map((item) => resolveOrderDisplayItem(tx, item))
  );
  const itemSubtotal = items.reduce(
    (total, item) => total + item.priceCents * item.quantity,
    0
  );
  const subtotalAmountCents = order.subtotalAmountCents ?? itemSubtotal;
  const discountAmountCents = order.discountAmountCents ?? 0;
  const taxAmountCents = order.taxAmountCents ?? 0;

  return {
    id: order.id,
    orderNumber: formatOrderNumber(order.id),
    status: order.status,
    statusLabel: orderStatusLabels[order.status],
    orderedAt: order.orderedAt,
    currency: order.currency,
    subtotalAmountCents,
    discountAmountCents,
    taxAmountCents,
    totalAmountCents: order.totalAmountCents,
    stripeCheckoutSessionId: order.stripeCheckoutSessionId,
    stripeReceiptUrl: order.stripeReceiptUrl,
    stripeInvoiceUrl: order.stripeInvoiceUrl,
    items
  };
}

export async function getOrderDisplayBySessionId(
  sessionId: string,
  userId: string
) {
  const order = await prisma.order.findFirst({
    where: {
      userId,
      stripeCheckoutSessionId: sessionId
    },
    include: {
      items: true
    }
  });

  return order ? toOrderDisplay(prisma, order) : null;
}

export async function getOrderDisplayById(orderId: string, userId: string) {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId
    },
    include: {
      items: true
    }
  });

  return order ? toOrderDisplay(prisma, order) : null;
}

export async function getOrderDisplaysForUser(userId: string) {
  const orders = await prisma.order.findMany({
    where: {
      userId
    },
    include: {
      items: true
    },
    orderBy: {
      orderedAt: 'desc'
    }
  });

  return Promise.all(orders.map((order) => toOrderDisplay(prisma, order)));
}
