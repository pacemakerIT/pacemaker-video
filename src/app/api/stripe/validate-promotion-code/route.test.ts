import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ItemType, OrderStatus } from '@prisma/client';
import type { Mock } from 'vitest';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn()
}));

const tx = {
  cart: {
    findMany: vi.fn()
  },
  course: {
    findFirst: vi.fn()
  },
  ebook: {
    findFirst: vi.fn()
  },
  workshop: {
    findUnique: vi.fn()
  },
  video: {
    findFirst: vi.fn()
  },
  orderItem: {
    findMany: vi.fn()
  },
  order: {
    findFirst: vi.fn()
  }
};

const prismaMock = {
  user: {
    findUnique: vi.fn()
  },
  $transaction: vi.fn()
};

const promotionCodesListMock = vi.fn();

vi.mock('@/lib/prisma', () => ({
  default: prismaMock
}));

vi.mock('@/lib/stripe', () => ({
  getStripeClient: vi.fn(() => ({
    promotionCodes: {
      list: promotionCodesListMock
    }
  }))
}));

const { auth } = await import('@clerk/nextjs/server');
const { POST } = await import('./route');

function createRequest(body: unknown) {
  return new Request(
    'http://localhost:3000/api/stripe/validate-promotion-code',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }
  );
}

describe('POST /api/stripe/validate-promotion-code', () => {
  const courseId = '11111111-1111-4111-8111-111111111111';

  beforeEach(() => {
    vi.clearAllMocks();

    (auth as unknown as Mock).mockResolvedValue({
      userId: 'clerk_user_123'
    });
    prismaMock.user.findUnique.mockResolvedValue({
      id: '33333333-3333-4333-8333-333333333333'
    });
    prismaMock.$transaction.mockImplementation(async (callback) =>
      callback(tx)
    );
    tx.cart.findMany.mockResolvedValue([
      {
        id: 'cart-1',
        itemId: courseId,
        itemType: ItemType.COURSE
      }
    ]);
    tx.course.findFirst.mockResolvedValue({
      id: courseId,
      title: 'Checkout Course',
      description: 'Course description',
      price: '49.99',
      category: 'INTERVIEW',
      thumbnailUrl: null
    });
    tx.orderItem.findMany.mockResolvedValue([]);
    tx.order.findFirst.mockResolvedValue(null);
    promotionCodesListMock.mockResolvedValue({
      data: [
        {
          id: 'promo_123',
          code: 'SAVE10',
          active: true,
          customer: null,
          customer_account: null,
          expires_at: null,
          max_redemptions: null,
          times_redeemed: 0,
          restrictions: {
            currency_options: undefined,
            first_time_transaction: false,
            minimum_amount: null,
            minimum_amount_currency: null
          }
        }
      ]
    });
  });

  it('validates an active public Stripe promotion code', async () => {
    const response = await POST(
      createRequest({
        selectedItems: [{ itemId: courseId, itemType: ItemType.COURSE }],
        promotionCode: 'SAVE10'
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      promotionCode: {
        code: 'SAVE10'
      }
    });
    expect(tx.order.findFirst).toHaveBeenCalledWith({
      where: {
        userId: '33333333-3333-4333-8333-333333333333',
        status: OrderStatus.COMPLETED
      },
      select: { id: true }
    });
    expect(promotionCodesListMock).toHaveBeenCalledWith({
      code: 'SAVE10',
      active: true,
      limit: 10
    });
  });

  it('rejects missing Stripe promotion codes', async () => {
    promotionCodesListMock.mockResolvedValue({ data: [] });

    const response = await POST(
      createRequest({
        selectedItems: [{ itemId: courseId, itemType: ItemType.COURSE }],
        promotionCode: 'MISSING'
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: 'Invalid promotion code'
    });
  });
});
