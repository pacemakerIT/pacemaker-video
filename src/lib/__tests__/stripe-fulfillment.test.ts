import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ItemType, OrderStatus } from '@prisma/client';
import type Stripe from 'stripe';

const tx = {
  $queryRaw: vi.fn(),
  order: {
    findFirst: vi.fn(),
    update: vi.fn()
  },
  userWorkshop: {
    upsert: vi.fn()
  },
  cart: {
    deleteMany: vi.fn()
  },
  video: {
    findMany: vi.fn()
  },
  ebook: {
    findMany: vi.fn()
  }
};

const prismaMock = {
  $transaction: vi.fn()
};

vi.mock('../prisma', () => ({
  default: prismaMock
}));

const { fulfillCheckoutSession } = await import('../stripe-fulfillment');

function stripeMock() {
  return {
    paymentIntents: {
      retrieve: vi.fn().mockResolvedValue({
        latest_charge: {
          receipt_url: 'https://stripe.test/receipt'
        }
      })
    },
    invoices: {
      retrieve: vi.fn().mockResolvedValue({
        hosted_invoice_url: 'https://stripe.test/invoice'
      })
    }
  } as unknown as Stripe;
}

function checkoutSession(
  overrides: Partial<Stripe.Checkout.Session> = {}
): Stripe.Checkout.Session {
  return {
    id: 'cs_test_123',
    client_reference_id: '22222222-2222-4222-8222-222222222222',
    metadata: {
      orderId: '22222222-2222-4222-8222-222222222222'
    },
    payment_status: 'paid',
    amount_subtotal: 10000,
    amount_total: 8500,
    total_details: {
      amount_discount: 1500,
      amount_shipping: 0,
      amount_tax: 0
    },
    currency: 'cad',
    payment_intent: 'pi_test_123',
    customer: 'cus_test_123',
    invoice: 'in_test_123',
    ...overrides
  } as Stripe.Checkout.Session;
}

function pendingOrder() {
  return {
    id: '22222222-2222-4222-8222-222222222222',
    userId: '33333333-3333-4333-8333-333333333333',
    status: OrderStatus.PENDING,
    stripeCheckoutSessionId: 'cs_test_123',
    stripeReceiptUrl: null,
    stripeInvoiceUrl: null,
    items: [
      {
        id: 'item-video',
        itemId: '44444444-4444-4444-8444-444444444444',
        itemType: ItemType.VIDEO
      },
      {
        id: 'item-ebook',
        itemId: '55555555-5555-4555-8555-555555555555',
        itemType: ItemType.EBOOK
      },
      {
        id: 'item-workshop',
        itemId: '66666666-6666-4666-8666-666666666666',
        itemType: ItemType.WORKSHOP
      }
    ]
  };
}

describe('fulfillCheckoutSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (callback) =>
      callback(tx)
    );
    tx.order.findFirst.mockResolvedValue(pendingOrder());
    tx.$queryRaw.mockResolvedValue([{ status: OrderStatus.PENDING }]);
    tx.order.update.mockResolvedValue({});
    tx.userWorkshop.upsert.mockResolvedValue({});
    tx.cart.deleteMany.mockResolvedValue({ count: 3 });
    tx.video.findMany.mockResolvedValue([
      {
        id: '44444444-4444-4444-8444-444444444444',
        videoId: 'wistia_video_123'
      }
    ]);
    tx.ebook.findMany.mockResolvedValue([
      {
        id: '55555555-5555-4555-8555-555555555555',
        ebookId: 'ebook-file.pdf'
      }
    ]);
  });

  it('marks paid checkout orders complete and grants fulfillment side effects', async () => {
    const result = await fulfillCheckoutSession(
      stripeMock(),
      checkoutSession()
    );

    expect(result).toEqual({
      orderId: '22222222-2222-4222-8222-222222222222',
      status: 'completed'
    });
    expect(tx.order.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [
          { id: '22222222-2222-4222-8222-222222222222' },
          { stripeCheckoutSessionId: 'cs_test_123' }
        ]
      },
      include: { items: true }
    });
    expect(tx.userWorkshop.upsert).toHaveBeenCalledWith({
      where: {
        userId_workshopId: {
          userId: '33333333-3333-4333-8333-333333333333',
          workshopId: '66666666-6666-4666-8666-666666666666'
        }
      },
      update: {
        orderId: '22222222-2222-4222-8222-222222222222'
      },
      create: {
        userId: '33333333-3333-4333-8333-333333333333',
        workshopId: '66666666-6666-4666-8666-666666666666',
        orderId: '22222222-2222-4222-8222-222222222222'
      }
    });
    expect(tx.video.findMany).toHaveBeenCalledWith({
      where: {
        id: { in: ['44444444-4444-4444-8444-444444444444'] }
      },
      select: { id: true, videoId: true }
    });
    expect(tx.ebook.findMany).toHaveBeenCalledWith({
      where: {
        id: { in: ['55555555-5555-4555-8555-555555555555'] }
      },
      select: { id: true, ebookId: true }
    });
    expect(tx.cart.deleteMany).toHaveBeenCalledWith({
      where: {
        userId: '33333333-3333-4333-8333-333333333333',
        OR: expect.arrayContaining([
          {
            itemId: '44444444-4444-4444-8444-444444444444',
            itemType: ItemType.VIDEO
          },
          { itemId: 'wistia_video_123', itemType: ItemType.VIDEO },
          {
            itemId: '55555555-5555-4555-8555-555555555555',
            itemType: ItemType.EBOOK
          },
          { itemId: 'ebook-file.pdf', itemType: ItemType.EBOOK },
          {
            itemId: '66666666-6666-4666-8666-666666666666',
            itemType: ItemType.WORKSHOP
          }
        ])
      }
    });
    expect(tx.order.update).toHaveBeenCalledWith({
      where: { id: '22222222-2222-4222-8222-222222222222' },
      data: expect.objectContaining({
        status: OrderStatus.COMPLETED,
        stripeCheckoutSessionId: 'cs_test_123',
        stripePaymentIntentId: 'pi_test_123',
        stripeCustomerId: 'cus_test_123',
        stripeInvoiceId: 'in_test_123',
        stripeInvoiceUrl: 'https://stripe.test/invoice',
        stripeReceiptUrl: 'https://stripe.test/receipt',
        subtotalAmountCents: 10000,
        discountAmountCents: 1500,
        taxAmountCents: 0,
        totalAmountCents: 8500,
        currency: 'cad'
      })
    });
  });

  it('ignores unpaid completed checkout sessions', async () => {
    const result = await fulfillCheckoutSession(
      stripeMock(),
      checkoutSession({ payment_status: 'unpaid' })
    );

    expect(result).toEqual({
      orderId: '22222222-2222-4222-8222-222222222222',
      status: 'ignored'
    });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('does not duplicate side effects for already completed orders', async () => {
    tx.order.findFirst.mockResolvedValue({
      ...pendingOrder(),
      status: OrderStatus.COMPLETED,
      stripeReceiptUrl: 'https://stripe.test/receipt',
      stripeInvoiceUrl: 'https://stripe.test/invoice'
    });
    tx.$queryRaw.mockResolvedValue([{ status: OrderStatus.COMPLETED }]);

    const result = await fulfillCheckoutSession(
      stripeMock(),
      checkoutSession()
    );

    expect(result).toEqual({
      orderId: '22222222-2222-4222-8222-222222222222',
      status: 'already_completed'
    });
    expect(tx.userWorkshop.upsert).not.toHaveBeenCalled();
    expect(tx.cart.deleteMany).not.toHaveBeenCalled();
    expect(tx.order.update).not.toHaveBeenCalled();
  });

  it('does not re-grant access when a late webhook hits a refunded order', async () => {
    tx.order.findFirst.mockResolvedValue({
      ...pendingOrder(),
      status: OrderStatus.REFUNDED
    });
    tx.$queryRaw.mockResolvedValue([{ status: OrderStatus.REFUNDED }]);

    const result = await fulfillCheckoutSession(
      stripeMock(),
      checkoutSession()
    );

    expect(result).toEqual({
      orderId: '22222222-2222-4222-8222-222222222222',
      status: 'already_refunded'
    });
    expect(tx.userWorkshop.upsert).not.toHaveBeenCalled();
    expect(tx.cart.deleteMany).not.toHaveBeenCalled();
    expect(tx.order.update).not.toHaveBeenCalled();
  });

  it('uses the locked status when a refund committed after the lookup', async () => {
    tx.$queryRaw.mockResolvedValue([{ status: OrderStatus.REFUNDED }]);

    const result = await fulfillCheckoutSession(
      stripeMock(),
      checkoutSession()
    );

    expect(result).toEqual({
      orderId: '22222222-2222-4222-8222-222222222222',
      status: 'already_refunded'
    });
    expect(tx.userWorkshop.upsert).not.toHaveBeenCalled();
    expect(tx.cart.deleteMany).not.toHaveBeenCalled();
    expect(tx.order.update).not.toHaveBeenCalled();
  });

  it('locks the order row before granting access', async () => {
    await fulfillCheckoutSession(stripeMock(), checkoutSession());

    const [sql, lockedOrderId] = tx.$queryRaw.mock.calls[0];
    expect(sql.join('?')).toContain('FOR UPDATE');
    expect(lockedOrderId).toBe('22222222-2222-4222-8222-222222222222');
    expect(tx.$queryRaw.mock.invocationCallOrder[0]).toBeLessThan(
      tx.userWorkshop.upsert.mock.invocationCallOrder[0]
    );
  });

  it('completes fulfillment when receipt and invoice lookups fail', async () => {
    const stripe = stripeMock() as Stripe & {
      paymentIntents: {
        retrieve: ReturnType<typeof vi.fn>;
      };
      invoices: {
        retrieve: ReturnType<typeof vi.fn>;
      };
    };
    stripe.paymentIntents.retrieve.mockRejectedValue(
      new Error('Stripe payment intent lookup failed')
    );
    stripe.invoices.retrieve.mockRejectedValue(
      new Error('Stripe invoice lookup failed')
    );

    const result = await fulfillCheckoutSession(stripe, checkoutSession());

    expect(result).toEqual({
      orderId: '22222222-2222-4222-8222-222222222222',
      status: 'completed'
    });
    expect(tx.userWorkshop.upsert).toHaveBeenCalled();
    expect(tx.cart.deleteMany).toHaveBeenCalled();
    expect(tx.order.update).toHaveBeenCalledWith({
      where: { id: '22222222-2222-4222-8222-222222222222' },
      data: expect.objectContaining({
        status: OrderStatus.COMPLETED,
        stripeCheckoutSessionId: 'cs_test_123',
        stripePaymentIntentId: 'pi_test_123',
        stripeCustomerId: 'cus_test_123',
        stripeInvoiceId: 'in_test_123'
      })
    });
    const updateData = tx.order.update.mock.calls[0][0].data;
    expect(updateData).not.toHaveProperty('stripeInvoiceUrl');
    expect(updateData).not.toHaveProperty('stripeReceiptUrl');
  });

  it('does not query video or ebook aliases when order has only workshops', async () => {
    tx.order.findFirst.mockResolvedValue({
      ...pendingOrder(),
      items: [
        {
          id: 'item-workshop',
          itemId: '66666666-6666-4666-8666-666666666666',
          itemType: ItemType.WORKSHOP
        }
      ]
    });

    const result = await fulfillCheckoutSession(
      stripeMock(),
      checkoutSession()
    );

    expect(result).toEqual({
      orderId: '22222222-2222-4222-8222-222222222222',
      status: 'completed'
    });
    expect(tx.video.findMany).not.toHaveBeenCalled();
    expect(tx.ebook.findMany).not.toHaveBeenCalled();
    expect(tx.cart.deleteMany).toHaveBeenCalledWith({
      where: {
        userId: '33333333-3333-4333-8333-333333333333',
        OR: [
          {
            itemId: '66666666-6666-4666-8666-666666666666',
            itemType: ItemType.WORKSHOP
          }
        ]
      }
    });
  });

  it('falls back to canonical order item ids when alias lookups miss', async () => {
    tx.video.findMany.mockResolvedValue([]);
    tx.ebook.findMany.mockResolvedValue([]);

    const result = await fulfillCheckoutSession(
      stripeMock(),
      checkoutSession()
    );

    expect(result).toEqual({
      orderId: '22222222-2222-4222-8222-222222222222',
      status: 'completed'
    });
    expect(tx.cart.deleteMany).toHaveBeenCalledWith({
      where: {
        userId: '33333333-3333-4333-8333-333333333333',
        OR: [
          {
            itemId: '44444444-4444-4444-8444-444444444444',
            itemType: ItemType.VIDEO
          },
          {
            itemId: '55555555-5555-4555-8555-555555555555',
            itemType: ItemType.EBOOK
          },
          {
            itemId: '66666666-6666-4666-8666-666666666666',
            itemType: ItemType.WORKSHOP
          }
        ]
      }
    });
  });

  it('acknowledges sessions from other integrations without an app order', async () => {
    tx.order.findFirst.mockResolvedValue(null);
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);

    try {
      const result = await fulfillCheckoutSession(
        stripeMock(),
        checkoutSession({
          id: 'cs_foreign',
          metadata: { orderId: 'INV-2026-0042' },
          client_reference_id: 'customer-77'
        })
      );

      expect(result).toEqual({ orderId: null, status: 'ignored' });
      expect(tx.order.findFirst).toHaveBeenCalledWith({
        where: { OR: [{ stripeCheckoutSessionId: 'cs_foreign' }] },
        include: { items: true }
      });
      expect(tx.$queryRaw).not.toHaveBeenCalled();
      expect(tx.order.update).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[STRIPE] Checkout session matched no order',
        { sessionId: 'cs_foreign', orderId: null }
      );
    } finally {
      consoleWarnSpy.mockRestore();
    }
  });

  it('acknowledges a UUID order id that matches no order', async () => {
    tx.order.findFirst.mockResolvedValue(null);
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);

    try {
      const result = await fulfillCheckoutSession(
        stripeMock(),
        checkoutSession()
      );

      expect(result).toEqual({ orderId: null, status: 'ignored' });
      expect(tx.userWorkshop.upsert).not.toHaveBeenCalled();
      expect(tx.order.update).not.toHaveBeenCalled();
    } finally {
      consoleWarnSpy.mockRestore();
    }
  });

  it('uses client_reference_id when metadata.orderId is not a UUID', async () => {
    await fulfillCheckoutSession(
      stripeMock(),
      checkoutSession({ metadata: { orderId: 'INV-2026-0042' } })
    );

    expect(tx.order.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [
          { id: '22222222-2222-4222-8222-222222222222' },
          { stripeCheckoutSessionId: 'cs_test_123' }
        ]
      },
      include: { items: true }
    });
  });

  it('reports no order id for unpaid sessions from other integrations', async () => {
    const result = await fulfillCheckoutSession(
      stripeMock(),
      checkoutSession({
        payment_status: 'unpaid',
        metadata: { orderId: 'INV-2026-0042' },
        client_reference_id: null
      })
    );

    expect(result).toEqual({ orderId: null, status: 'ignored' });
  });
});
