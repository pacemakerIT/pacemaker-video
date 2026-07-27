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
    findFirst: vi.fn(),
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
const promotionCodesListMock = vi.fn();

vi.mock('@/lib/prisma', () => ({
  default: prismaMock
}));

vi.mock('@/lib/stripe', () => ({
  getStripeClient: vi.fn(() => ({
    checkout: {
      sessions: {
        create: stripeSessionCreateMock
      }
    },
    promotionCodes: {
      list: promotionCodesListMock
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
    tx.order.create.mockResolvedValue({
      id: orderId
    });
    promotionCodesListMock.mockResolvedValue({
      data: []
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

  it('rejects empty checkout selections', async () => {
    const response = await POST(createRequest({ selectedItems: [] }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: 'No checkout items selected'
    });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(stripeSessionCreateMock).not.toHaveBeenCalled();
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
        allow_promotion_codes: true,
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

  it('applies a validated Stripe promotion code to the checkout session', async () => {
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

    const response = await POST(
      createRequest({
        selectedItems: [{ itemId: courseId, itemType: ItemType.COURSE }],
        promotionCode: 'SAVE10'
      })
    );

    expect(response.status).toBe(201);
    expect(promotionCodesListMock).toHaveBeenCalledWith({
      code: 'SAVE10',
      active: true,
      limit: 10
    });
    expect(stripeSessionCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        discounts: [{ promotion_code: 'promo_123' }],
        metadata: expect.objectContaining({
          promotionCode: 'SAVE10'
        })
      })
    );
  });

  it('rejects invalid promotion codes before creating an order', async () => {
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
    expect(tx.order.create).not.toHaveBeenCalled();
    expect(stripeSessionCreateMock).not.toHaveBeenCalled();
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

  it('rejects selected items that are no longer in the cart', async () => {
    tx.cart.findMany.mockResolvedValue([]);

    const response = await POST(
      createRequest({
        selectedItems: [{ itemId: courseId, itemType: ItemType.COURSE }]
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: 'Selected cart items were not found'
    });
    expect(tx.order.create).not.toHaveBeenCalled();
    expect(stripeSessionCreateMock).not.toHaveBeenCalled();
  });

  it('rejects cart items that no longer resolve to catalog content', async () => {
    tx.course.findFirst.mockResolvedValue(null);

    const response = await POST(
      createRequest({
        selectedItems: [{ itemId: courseId, itemType: ItemType.COURSE }]
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: 'One or more selected items are unavailable'
    });
    expect(tx.order.create).not.toHaveBeenCalled();
    expect(stripeSessionCreateMock).not.toHaveBeenCalled();
  });

  it('rejects checkout items with invalid prices', async () => {
    tx.course.findFirst.mockResolvedValue({
      id: courseId,
      title: 'Checkout Course',
      description: 'Course description',
      price: '0',
      category: 'INTERVIEW',
      thumbnailUrl: null
    });

    const response = await POST(
      createRequest({
        selectedItems: [{ itemId: courseId, itemType: ItemType.COURSE }]
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: 'Checkout Course has an invalid price'
    });
    expect(tx.order.create).not.toHaveBeenCalled();
    expect(stripeSessionCreateMock).not.toHaveBeenCalled();
  });

  it('marks the pending order failed when Stripe does not return a URL', async () => {
    stripeSessionCreateMock.mockResolvedValue({
      id: 'cs_test_123',
      url: null
    });

    const response = await POST(
      createRequest({
        selectedItems: [{ itemId: courseId, itemType: ItemType.COURSE }]
      })
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: 'Failed to create checkout session'
    });
    expect(prismaMock.order.update).toHaveBeenCalledWith({
      where: { id: orderId },
      data: { status: OrderStatus.FAILED }
    });
  });
});
