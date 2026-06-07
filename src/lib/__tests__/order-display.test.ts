import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ItemType, OrderStatus } from '@prisma/client';

const prismaMock = {
  order: {
    findMany: vi.fn()
  },
  course: {
    findUnique: vi.fn()
  },
  ebook: {
    findUnique: vi.fn()
  },
  workshop: {
    findUnique: vi.fn()
  },
  video: {
    findUnique: vi.fn()
  }
};

vi.mock('../prisma', () => ({
  default: prismaMock
}));

const { getOrderDisplaysForUser } = await import('../order-display');

describe('order display helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps real order rows to purchase display data', async () => {
    const orderedAt = new Date('2026-06-07T12:00:00.000Z');

    prismaMock.order.findMany.mockResolvedValue([
      {
        id: '22222222-2222-4222-8222-222222222222',
        status: OrderStatus.COMPLETED,
        orderedAt,
        currency: 'cad',
        subtotalAmountCents: 4999,
        discountAmountCents: 0,
        taxAmountCents: 0,
        totalAmountCents: 4999,
        stripeCheckoutSessionId: 'cs_test_123',
        stripeReceiptUrl: 'https://stripe.test/receipt',
        stripeInvoiceUrl: null,
        items: [
          {
            id: 'item-1',
            itemId: '11111111-1111-4111-8111-111111111111',
            itemType: ItemType.COURSE,
            priceAtPurchaseCents: 4999,
            quantity: 1
          }
        ]
      }
    ]);
    prismaMock.course.findUnique.mockResolvedValue({
      id: '11111111-1111-4111-8111-111111111111',
      title: 'Checkout Course',
      category: 'INTERVIEW',
      thumbnailUrl: 'https://cdn.test/course.jpg'
    });

    const orders = await getOrderDisplaysForUser(
      '33333333-3333-4333-8333-333333333333'
    );

    expect(orders).toEqual([
      expect.objectContaining({
        id: '22222222-2222-4222-8222-222222222222',
        orderNumber: 'No. 22222222',
        statusLabel: '결제완료',
        totalAmountCents: 4999,
        stripeReceiptUrl: 'https://stripe.test/receipt',
        items: [
          expect.objectContaining({
            title: 'Checkout Course',
            typeLabel: '온라인 강의',
            category: 'INTERVIEW',
            actionHref: '/courses/11111111-1111-4111-8111-111111111111'
          })
        ]
      })
    ]);
  });

  it('keeps fallback item data when catalog content is missing', async () => {
    prismaMock.order.findMany.mockResolvedValue([
      {
        id: '22222222-2222-4222-8222-222222222222',
        status: OrderStatus.PENDING,
        orderedAt: new Date('2026-06-07T12:00:00.000Z'),
        currency: 'cad',
        subtotalAmountCents: null,
        discountAmountCents: null,
        taxAmountCents: null,
        totalAmountCents: 2500,
        stripeCheckoutSessionId: null,
        stripeReceiptUrl: null,
        stripeInvoiceUrl: null,
        items: [
          {
            id: 'item-1',
            itemId: 'missing-course',
            itemType: ItemType.COURSE,
            priceAtPurchaseCents: 2500,
            quantity: 1
          }
        ]
      }
    ]);
    prismaMock.course.findUnique.mockResolvedValue(null);

    const orders = await getOrderDisplaysForUser(
      '33333333-3333-4333-8333-333333333333'
    );

    expect(orders[0]).toMatchObject({
      statusLabel: '결제확인중',
      subtotalAmountCents: 2500,
      discountAmountCents: 0,
      taxAmountCents: 0,
      items: [
        expect.objectContaining({
          title: '구매 항목',
          actionHref: '/mypage/purchases'
        })
      ]
    });
  });
});
