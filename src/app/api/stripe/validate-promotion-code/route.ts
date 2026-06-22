import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { OrderStatus } from '@prisma/client';
import {
  assertNoCompletedPurchases,
  calculateCheckoutTotals,
  CHECKOUT_CURRENCY,
  CheckoutError,
  getCheckoutCartItems,
  parseCheckoutSelections
} from '@/lib/checkout-items';
import prisma from '@/lib/prisma';
import { getStripeClient } from '@/lib/stripe';
import {
  parseOptionalPromotionCode,
  validateStripePromotionCode
} from '@/lib/stripe-promotion-codes';

export const runtime = 'nodejs';

function errorResponse(error: unknown) {
  if (error instanceof CheckoutError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status }
    );
  }

  return NextResponse.json(
    { error: 'Failed to validate promotion code' },
    { status: 500 }
  );
}

export async function POST(req: Request) {
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

    if (!promotionCode) {
      throw new CheckoutError('Promotion code is required', 400);
    }

    const currentUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const checkoutState = await prisma.$transaction(async (tx) => {
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
        hasCompletedOrder: Boolean(completedOrder),
        totals
      };
    });

    const validatedPromotionCode = await validateStripePromotionCode(
      getStripeClient(),
      {
        code: promotionCode,
        subtotalAmountCents: checkoutState.totals.subtotalAmountCents,
        currency: CHECKOUT_CURRENCY,
        hasCompletedOrder: checkoutState.hasCompletedOrder
      }
    );

    return NextResponse.json({
      promotionCode: {
        code: validatedPromotionCode.code
      }
    });
  } catch (error) {
    return errorResponse(error);
  }
}
