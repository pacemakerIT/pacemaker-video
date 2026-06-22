import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { OrderStatus } from '@prisma/client';
import type Stripe from 'stripe';
import {
  assertNoCompletedPurchases,
  calculateCheckoutTotals,
  CHECKOUT_CURRENCY,
  CheckoutCartItem,
  CheckoutError,
  getCheckoutCartItems,
  parseCheckoutSelections
} from '@/lib/checkout-items';
import {
  buildCheckoutSuccessUrl,
  getAppBaseUrl,
  getMetadataValue,
  toAbsoluteUrl
} from '@/lib/checkout-utils';
import prisma from '@/lib/prisma';
import { getStripeClient } from '@/lib/stripe';
import {
  parseOptionalPromotionCode,
  validateStripePromotionCode
} from '@/lib/stripe-promotion-codes';

export const runtime = 'nodejs';

function buildCheckoutLineItems(
  items: CheckoutCartItem[]
): Stripe.Checkout.SessionCreateParams.LineItem[] {
  return items.map((item) => ({
    quantity: item.quantity,
    price_data: {
      currency: CHECKOUT_CURRENCY,
      unit_amount: item.unitAmountCents,
      product_data: {
        name: getMetadataValue(item.title),
        metadata: {
          itemId: getMetadataValue(item.itemId),
          itemType: getMetadataValue(item.itemType)
        }
      }
    }
  }));
}

function buildItemSummary(items: CheckoutCartItem[]) {
  return items
    .map((item) => `${item.itemType}:${item.itemId}`)
    .join(',')
    .slice(0, 500);
}

function errorResponse(error: unknown) {
  if (error instanceof CheckoutError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status }
    );
  }

  return NextResponse.json(
    { error: 'Failed to create checkout session' },
    { status: 500 }
  );
}

export async function POST(req: Request) {
  let pendingOrderId: string | null = null;

  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => {
      throw new CheckoutError('Invalid request body', 400);
    });
    const selections = parseCheckoutSelections(body);
    const promotionCode = parseOptionalPromotionCode(body);

    const currentUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: {
        id: true,
        email: true
      }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const preparedCheckout = await prisma.$transaction(async (tx) => {
      const checkoutItems = await getCheckoutCartItems(
        tx,
        currentUser.id,
        selections
      );
      await assertNoCompletedPurchases(tx, currentUser.id, checkoutItems);

      const totals = calculateCheckoutTotals(checkoutItems);
      const completedOrder = await tx.order.findFirst({
        where: {
          userId: currentUser.id,
          status: OrderStatus.COMPLETED
        },
        select: { id: true }
      });

      return {
        checkoutItems,
        hasCompletedOrder: Boolean(completedOrder),
        totals
      };
    });

    const appBaseUrl = getAppBaseUrl(req);
    const stripe = getStripeClient();
    const validatedPromotionCode = promotionCode
      ? await validateStripePromotionCode(stripe, {
          code: promotionCode,
          subtotalAmountCents: preparedCheckout.totals.subtotalAmountCents,
          currency: CHECKOUT_CURRENCY,
          hasCompletedOrder: preparedCheckout.hasCompletedOrder
        })
      : null;

    const order = await prisma.$transaction(async (tx) =>
      tx.order.create({
        data: {
          userId: currentUser.id,
          currency: CHECKOUT_CURRENCY,
          status: OrderStatus.PENDING,
          totalAmountCents: preparedCheckout.totals.totalAmountCents,
          subtotalAmountCents: preparedCheckout.totals.subtotalAmountCents,
          discountAmountCents: preparedCheckout.totals.discountAmountCents,
          taxAmountCents: preparedCheckout.totals.taxAmountCents,
          items: {
            create: preparedCheckout.checkoutItems.map((item) => ({
              itemId: item.itemId,
              itemType: item.itemType,
              priceAtPurchaseCents: item.unitAmountCents,
              quantity: item.quantity
            }))
          }
        }
      })
    );

    pendingOrderId = order.id;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: buildCheckoutLineItems(preparedCheckout.checkoutItems),
      success_url: buildCheckoutSuccessUrl(
        appBaseUrl,
        '/mypage/payment-success'
      ),
      cancel_url: toAbsoluteUrl(
        appBaseUrl,
        `/payment/cancel?order_id=${order.id}`
      ),
      client_reference_id: order.id,
      customer_email: currentUser.email,
      ...(validatedPromotionCode
        ? { discounts: [{ promotion_code: validatedPromotionCode.id }] }
        : { allow_promotion_codes: true }),
      metadata: {
        orderId: getMetadataValue(order.id),
        userId: getMetadataValue(currentUser.id),
        clerkUserId: getMetadataValue(clerkUserId),
        promotionCode: getMetadataValue(validatedPromotionCode?.code),
        itemSummary: getMetadataValue(
          buildItemSummary(preparedCheckout.checkoutItems)
        )
      }
    });

    if (!session.url) {
      throw new Error('Stripe did not return a checkout URL');
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        stripeCheckoutSessionId: session.id
      }
    });

    return NextResponse.json(
      {
        checkoutUrl: session.url,
        orderId: order.id,
        sessionId: session.id,
        totals: preparedCheckout.totals
      },
      { status: 201 }
    );
  } catch (error) {
    if (pendingOrderId && !(error instanceof CheckoutError)) {
      await prisma.order
        .update({
          where: { id: pendingOrderId },
          data: { status: OrderStatus.FAILED }
        })
        .catch(() => undefined);
    }

    return errorResponse(error);
  }
}
