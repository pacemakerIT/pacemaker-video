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
    findUnique: vi.fn()
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
    create: vi.fn()
  }
};

const prismaMock = {
  user: {
    findUnique: vi.fn()
  },
  order: {
    update: vi.fn()
  },
  $transaction: vi.fn()
};

const stripeSessionCreateMock = vi.fn();

vi.mock('@/lib/prisma', () => ({
  default: prismaMock
}));

vi.mock('@/lib/stripe', () => ({
  getStripeClient: vi.fn(() => ({
    checkout: {
      sessions: {
        create: stripeSessionCreateMock
      }
    }
  }))
}));

const { auth } = await import('@clerk/nextjs/server');
const { POST } = await import('./route');

function createRequest(body: unknown) {
  return new Request(
    'http://localhost:3000/api/stripe/create-checkout-session',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        origin: 'http://localhost:3000'
      },
      body: JSON.stringify(body)
    }
  );
}

describe('POST /api/stripe/create-checkout-session', () => {
  const courseId = '11111111-1111-4111-8111-111111111111';
  const orderId = '22222222-2222-4222-8222-222222222222';

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

    (auth as unknown as Mock).mockResolvedValue({
      userId: 'clerk_user_123'
    });
    prismaMock.user.findUnique.mockResolvedValue({
      id: '33333333-3333-4333-8333-333333333333',
      email: 'buyer@example.com'
    });
    prismaMock.$transaction.mockImplementation(async (callback) =>
      callback(tx)
    );
    prismaMock.order.update.mockResolvedValue({});
    tx.cart.findMany.mockResolvedValue([
      {
        id: 'cart-1',
        itemId: courseId,
        itemType: ItemType.COURSE
      }
    ]);
    tx.course.findUnique.mockResolvedValue({
      id: courseId,
      title: 'Checkout Course',
      description: 'Course description',
      price: '49.99',
      category: 'INTERVIEW',
      thumbnailUrl: null
    });
    tx.orderItem.findMany.mockResolvedValue([]);
    tx.order.create.mockResolvedValue({
      id: orderId
    });
    stripeSessionCreateMock.mockResolvedValue({
      id: 'cs_test_123',
      url: 'https://checkout.stripe.test/session'
    });
  });

  it('returns 401 when the user is not authenticated', async () => {
    (auth as unknown as Mock).mockResolvedValue({ userId: null });

    const response = await POST(
      createRequest({
        selectedItems: [{ itemId: courseId, itemType: ItemType.COURSE }]
      })
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Unauthorized' });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('creates a pending order and Stripe checkout session', async () => {
    const response = await POST(
      createRequest({
        selectedItems: [{ itemId: courseId, itemType: ItemType.COURSE }]
      })
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      checkoutUrl: 'https://checkout.stripe.test/session',
      orderId,
      sessionId: 'cs_test_123',
      totals: {
        subtotalAmountCents: 4999,
        discountAmountCents: 0,
        taxAmountCents: 0,
        totalAmountCents: 4999
      }
    });
    expect(tx.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: '33333333-3333-4333-8333-333333333333',
          status: OrderStatus.PENDING,
          totalAmountCents: 4999,
          items: {
            create: [
              {
                itemId: courseId,
                itemType: ItemType.COURSE,
                priceAtPurchaseCents: 4999,
                quantity: 1
              }
            ]
          }
        })
      })
    );
    expect(stripeSessionCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'payment',
        client_reference_id: orderId,
        customer_email: 'buyer@example.com',
        success_url:
          'http://localhost:3000/mypage/payment-success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: `http://localhost:3000/payment/cancel?order_id=${orderId}`
      })
    );
    expect(prismaMock.order.update).toHaveBeenCalledWith({
      where: { id: orderId },
      data: { stripeCheckoutSessionId: 'cs_test_123' }
    });
  });

  it('rejects already purchased items before creating a Stripe session', async () => {
    tx.orderItem.findMany.mockResolvedValue([
      {
        itemId: courseId,
        itemType: ItemType.COURSE
      }
    ]);

    const response = await POST(
      createRequest({
        selectedItems: [{ itemId: courseId, itemType: ItemType.COURSE }]
      })
    );

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      error: 'Already purchased: Checkout Course'
    });
    expect(tx.order.create).not.toHaveBeenCalled();
    expect(stripeSessionCreateMock).not.toHaveBeenCalled();
  });
});
