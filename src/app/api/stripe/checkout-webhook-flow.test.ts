import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ItemType, OrderStatus } from '@prisma/client';
import type Stripe from 'stripe';
import type { Mock } from 'vitest';

type CartRow = {
  id: string;
  userId: string;
  itemId: string;
  itemType: ItemType;
};

type CatalogVideo = {
  id: string;
  videoId: string;
  title: string;
  description: string | null;
  price: string;
  category: string | null;
  thumbnail: string | null;
};

type CatalogEbook = {
  id: string;
  ebookId: string;
  title: string;
  description: string | null;
  price: string;
  category: string | null;
  thumbnail: string | null;
};

type OrderItemRow = {
  id: string;
  orderId: string;
  itemId: string;
  itemType: ItemType;
  priceAtPurchaseCents: number;
  quantity: number;
};

type OrderRow = {
  id: string;
  userId: string | null;
  totalAmountCents: number;
  subtotalAmountCents: number | null;
  discountAmountCents: number | null;
  taxAmountCents: number | null;
  currency: string;
  status: OrderStatus;
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
  stripeCustomerId: string | null;
  stripeInvoiceId: string | null;
  stripeInvoiceUrl: string | null;
  stripeReceiptUrl: string | null;
  items: OrderItemRow[];
};

const userId = '33333333-3333-4333-8333-333333333333';
const clerkUserId = 'clerk_user_flow';
const orderId = '22222222-2222-4222-8222-222222222222';
const checkoutSessionId = 'cs_flow_123';
const videoExternalId = 'wistia_flow_001';
const videoDbId = '44444444-4444-4444-8444-444444444444';
const ebookExternalId = 'flow-ebook.pdf';
const ebookDbId = '55555555-5555-4555-8555-555555555555';

const db: {
  carts: CartRow[];
  videos: CatalogVideo[];
  ebooks: CatalogEbook[];
  orders: OrderRow[];
} = {
  carts: [],
  videos: [],
  ebooks: [],
  orders: []
};

const tx = {
  cart: {
    findMany: vi.fn(),
    deleteMany: vi.fn()
  },
  course: {
    findUnique: vi.fn()
  },
  ebook: {
    findFirst: vi.fn(),
    findMany: vi.fn()
  },
  workshop: {
    findUnique: vi.fn()
  },
  video: {
    findFirst: vi.fn(),
    findMany: vi.fn()
  },
  orderItem: {
    findMany: vi.fn()
  },
  order: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn()
  },
  userWorkshop: {
    upsert: vi.fn()
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
const stripeConstructEventMock = vi.fn();
const stripePaymentIntentRetrieveMock = vi.fn();
const stripeInvoiceRetrieveMock = vi.fn();
const stripePromotionCodesListMock = vi.fn();
const stripeClientMock = {
  checkout: {
    sessions: {
      create: stripeSessionCreateMock
    }
  },
  webhooks: {
    constructEvent: stripeConstructEventMock
  },
  paymentIntents: {
    retrieve: stripePaymentIntentRetrieveMock
  },
  invoices: {
    retrieve: stripeInvoiceRetrieveMock
  },
  promotionCodes: {
    list: stripePromotionCodesListMock
  }
};

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn()
}));

vi.mock('@/lib/prisma', () => ({
  default: prismaMock
}));

vi.mock('@/lib/stripe', () => ({
  getStripeClient: vi.fn(() => stripeClientMock)
}));

const { auth } = await import('@clerk/nextjs/server');
const { POST: createCheckoutSession } =
  await import('./create-checkout-session/route');
const { POST: receiveStripeWebhook } = await import('./webhook/route');

function createCheckoutRequest() {
  return new Request(
    'http://localhost:3000/api/stripe/create-checkout-session',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        origin: 'http://localhost:3000'
      },
      body: JSON.stringify({
        selectedItems: [
          { itemId: videoExternalId, itemType: ItemType.VIDEO },
          { itemId: ebookExternalId, itemType: ItemType.EBOOK }
        ]
      })
    }
  );
}

function createWebhookRequest() {
  return new Request('http://localhost:3000/api/stripe/webhook', {
    method: 'POST',
    headers: {
      'stripe-signature': 'valid-signature'
    },
    body: JSON.stringify({ id: 'evt_flow_123' })
  });
}

function checkoutSessionEvent(
  paymentStatus: Stripe.Checkout.Session['payment_status']
): Stripe.Event {
  return {
    id: 'evt_flow_123',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: checkoutSessionId,
        client_reference_id: orderId,
        metadata: {
          orderId
        },
        payment_status: paymentStatus,
        amount_subtotal: 3050,
        amount_total: 3050,
        total_details: {
          amount_discount: 0,
          amount_shipping: 0,
          amount_tax: 0
        },
        currency: 'cad',
        payment_intent: 'pi_flow_123',
        customer: 'cus_flow_123',
        invoice: 'in_flow_123'
      } as unknown as Stripe.Checkout.Session
    }
  } as Stripe.Event;
}

function orderMatchesFilter(
  order: OrderRow,
  condition: Record<string, string>
) {
  if ('id' in condition) return order.id === condition.id;
  if ('stripeCheckoutSessionId' in condition) {
    return order.stripeCheckoutSessionId === condition.stripeCheckoutSessionId;
  }
  return false;
}

function updateOrder(args: { where: { id: string }; data: Partial<OrderRow> }) {
  const order = db.orders.find((row) => row.id === args.where.id);

  if (!order) throw new Error(`Order not found: ${args.where.id}`);

  Object.assign(order, args.data);
  return Promise.resolve(order);
}

function resetFlowState() {
  db.carts = [
    {
      id: 'cart-video',
      userId,
      itemId: videoExternalId,
      itemType: ItemType.VIDEO
    },
    {
      id: 'cart-ebook',
      userId,
      itemId: ebookExternalId,
      itemType: ItemType.EBOOK
    }
  ];
  db.videos = [
    {
      id: videoDbId,
      videoId: videoExternalId,
      title: 'Flow Video',
      description: 'Video in checkout flow',
      price: '20.00',
      category: 'INTERVIEW',
      thumbnail: null
    }
  ];
  db.ebooks = [
    {
      id: ebookDbId,
      ebookId: ebookExternalId,
      title: 'Flow Ebook',
      description: 'Ebook in checkout flow',
      price: '10.50',
      category: 'RESUME',
      thumbnail: null
    }
  ];
  db.orders = [];
}

function installPrismaBehavior() {
  prismaMock.user.findUnique.mockResolvedValue({
    id: userId,
    email: 'buyer@example.com'
  });
  prismaMock.$transaction.mockImplementation(async (callback) => callback(tx));
  prismaMock.order.update.mockImplementation(updateOrder);

  tx.cart.findMany.mockImplementation(({ where }) =>
    Promise.resolve(
      db.carts.filter(
        (cart) =>
          cart.userId === where.userId &&
          where.OR.some(
            (selection: { itemId: string; itemType: ItemType }) =>
              cart.itemId === selection.itemId &&
              cart.itemType === selection.itemType
          )
      )
    )
  );
  tx.cart.deleteMany.mockImplementation(({ where }) => {
    const originalCount = db.carts.length;
    db.carts = db.carts.filter(
      (cart) =>
        cart.userId !== where.userId ||
        !where.OR.some(
          (filter: { itemId: string; itemType: ItemType }) =>
            cart.itemId === filter.itemId && cart.itemType === filter.itemType
        )
    );

    return Promise.resolve({ count: originalCount - db.carts.length });
  });
  tx.video.findFirst.mockImplementation(({ where }) =>
    Promise.resolve(
      db.videos.find((video) =>
        where.OR.some(
          (condition: { id?: string; videoId?: string }) =>
            video.id === condition.id || video.videoId === condition.videoId
        )
      ) ?? null
    )
  );
  tx.video.findMany.mockImplementation(({ where }) =>
    Promise.resolve(
      db.videos
        .filter((video) => where.id.in.includes(video.id))
        .map(({ id, videoId }) => ({ id, videoId }))
    )
  );
  tx.ebook.findFirst.mockImplementation(({ where }) =>
    Promise.resolve(
      db.ebooks.find((ebook) =>
        where.OR.some(
          (condition: { id?: string; ebookId?: string }) =>
            ebook.id === condition.id || ebook.ebookId === condition.ebookId
        )
      ) ?? null
    )
  );
  tx.ebook.findMany.mockImplementation(({ where }) =>
    Promise.resolve(
      db.ebooks
        .filter((ebook) => where.id.in.includes(ebook.id))
        .map(({ id, ebookId }) => ({ id, ebookId }))
    )
  );
  tx.course.findUnique.mockResolvedValue(null);
  tx.workshop.findUnique.mockResolvedValue(null);
  tx.orderItem.findMany.mockImplementation(({ where }) =>
    Promise.resolve(
      db.orders
        .filter(
          (order) =>
            order.userId === where.order.userId &&
            order.status === where.order.status
        )
        .flatMap((order) => order.items)
        .filter((item) =>
          where.OR.some(
            (selection: { itemId: string; itemType: ItemType }) =>
              item.itemId === selection.itemId &&
              item.itemType === selection.itemType
          )
        )
        .map(({ itemId, itemType }) => ({ itemId, itemType }))
    )
  );
  tx.order.findFirst.mockImplementation(({ where, include, select }) => {
    let order: OrderRow | undefined;

    if (where.OR) {
      order = db.orders.find((row) =>
        where.OR.some((condition: Record<string, string>) =>
          orderMatchesFilter(row, condition)
        )
      );
    } else {
      order = db.orders.find(
        (row) => row.userId === where.userId && row.status === where.status
      );
    }

    if (!order) return Promise.resolve(null);
    if (select?.id && !include) return Promise.resolve({ id: order.id });

    return Promise.resolve(order);
  });
  tx.order.create.mockImplementation(({ data }) => {
    const order: OrderRow = {
      id: orderId,
      userId: data.userId,
      totalAmountCents: data.totalAmountCents,
      subtotalAmountCents: data.subtotalAmountCents,
      discountAmountCents: data.discountAmountCents,
      taxAmountCents: data.taxAmountCents,
      currency: data.currency,
      status: data.status,
      stripeCheckoutSessionId: null,
      stripePaymentIntentId: null,
      stripeCustomerId: null,
      stripeInvoiceId: null,
      stripeInvoiceUrl: null,
      stripeReceiptUrl: null,
      items: data.items.create.map(
        (
          item: {
            itemId: string;
            itemType: ItemType;
            priceAtPurchaseCents: number;
            quantity: number;
          },
          index: number
        ) => ({
          id: `order-item-${index + 1}`,
          orderId,
          ...item
        })
      )
    };

    db.orders.push(order);
    return Promise.resolve({ id: order.id });
  });
  tx.order.update.mockImplementation(updateOrder);
  tx.userWorkshop.upsert.mockResolvedValue({});
}

async function createCheckoutThenWebhook(
  paymentStatus: Stripe.Checkout.Session['payment_status']
) {
  stripeConstructEventMock.mockReturnValue(checkoutSessionEvent(paymentStatus));

  const checkoutResponse = await createCheckoutSession(createCheckoutRequest());

  expect(checkoutResponse.status).toBe(201);

  return receiveStripeWebhook(createWebhookRequest());
}

describe('checkout to Stripe webhook flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_flow_test';
    resetFlowState();
    installPrismaBehavior();

    (auth as unknown as Mock).mockResolvedValue({ userId: clerkUserId });
    stripeSessionCreateMock.mockResolvedValue({
      id: checkoutSessionId,
      url: 'https://checkout.stripe.test/flow-session'
    });
    stripePaymentIntentRetrieveMock.mockResolvedValue({
      latest_charge: {
        receipt_url: 'https://stripe.test/flow-receipt'
      }
    });
    stripeInvoiceRetrieveMock.mockResolvedValue({
      hosted_invoice_url: 'https://stripe.test/flow-invoice'
    });
    stripePromotionCodesListMock.mockResolvedValue({ data: [] });
  });

  it('creates checkout and completes the order from a paid webhook', async () => {
    const webhookResponse = await createCheckoutThenWebhook('paid');
    const order = db.orders[0];

    expect(webhookResponse.status).toBe(200);
    expect(await webhookResponse.json()).toEqual({
      received: true,
      fulfillment: {
        orderId,
        status: 'completed'
      }
    });
    expect(order.status).toBe(OrderStatus.COMPLETED);
    expect(order.stripeCheckoutSessionId).toBe(checkoutSessionId);
    expect(order.stripePaymentIntentId).toBe('pi_flow_123');
    expect(order.stripeCustomerId).toBe('cus_flow_123');
    expect(order.stripeInvoiceId).toBe('in_flow_123');
    expect(order.stripeInvoiceUrl).toBe('https://stripe.test/flow-invoice');
    expect(order.stripeReceiptUrl).toBe('https://stripe.test/flow-receipt');
    expect(order.items.map((item) => item.itemId)).toEqual([
      videoDbId,
      ebookDbId
    ]);
    expect(db.carts).toEqual([]);
    expect(tx.cart.deleteMany).toHaveBeenCalledWith({
      where: {
        userId,
        OR: expect.arrayContaining([
          { itemId: videoDbId, itemType: ItemType.VIDEO },
          { itemId: videoExternalId, itemType: ItemType.VIDEO },
          { itemId: ebookDbId, itemType: ItemType.EBOOK },
          { itemId: ebookExternalId, itemType: ItemType.EBOOK }
        ])
      }
    });
  });

  it('keeps the order pending and cart intact for an unpaid webhook', async () => {
    const webhookResponse = await createCheckoutThenWebhook('unpaid');
    const order = db.orders[0];

    expect(webhookResponse.status).toBe(200);
    expect(await webhookResponse.json()).toEqual({
      received: true,
      fulfillment: {
        orderId,
        status: 'ignored'
      }
    });
    expect(order.status).toBe(OrderStatus.PENDING);
    expect(db.carts).toHaveLength(2);
    expect(tx.cart.deleteMany).not.toHaveBeenCalled();
    expect(tx.order.update).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: OrderStatus.COMPLETED })
      })
    );
  });

  it('treats a repeated paid webhook as already completed without cleanup side effects', async () => {
    const firstWebhookResponse = await createCheckoutThenWebhook('paid');

    expect(firstWebhookResponse.status).toBe(200);
    await firstWebhookResponse.json();
    expect(db.orders[0].status).toBe(OrderStatus.COMPLETED);

    tx.cart.deleteMany.mockClear();
    tx.video.findMany.mockClear();
    tx.ebook.findMany.mockClear();

    stripeConstructEventMock.mockReturnValue(checkoutSessionEvent('paid'));

    const secondWebhookResponse = await receiveStripeWebhook(
      createWebhookRequest()
    );

    expect(secondWebhookResponse.status).toBe(200);
    expect(await secondWebhookResponse.json()).toEqual({
      received: true,
      fulfillment: {
        orderId,
        status: 'already_completed'
      }
    });
    expect(tx.cart.deleteMany).not.toHaveBeenCalled();
    expect(tx.video.findMany).not.toHaveBeenCalled();
    expect(tx.ebook.findMany).not.toHaveBeenCalled();
  });
});
