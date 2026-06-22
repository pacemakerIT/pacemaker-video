import type Stripe from 'stripe';
import { CheckoutError } from './checkout-items';

const PROMOTION_CODE_PATTERN = /^[a-z0-9-]+$/i;
const MAX_PROMOTION_CODE_LENGTH = 80;

export type ValidatedPromotionCode = {
  id: string;
  code: string;
};

export function parseOptionalPromotionCode(body: unknown) {
  const value = body as { promotionCode?: unknown };
  const rawCode = value.promotionCode;

  if (rawCode === undefined || rawCode === null) return null;
  if (typeof rawCode !== 'string') {
    throw new CheckoutError('Invalid promotion code', 400);
  }

  const code = rawCode.trim();
  if (!code) return null;

  if (
    code.length > MAX_PROMOTION_CODE_LENGTH ||
    !PROMOTION_CODE_PATTERN.test(code)
  ) {
    throw new CheckoutError('Invalid promotion code', 400);
  }

  return code;
}

function getMinimumAmountCents(
  promotionCode: Stripe.PromotionCode,
  currency: string
) {
  const currencyKey = currency.toLowerCase();
  const currencyMinimum =
    promotionCode.restrictions.currency_options?.[currencyKey]?.minimum_amount;

  if (currencyMinimum !== undefined) return currencyMinimum;

  if (
    promotionCode.restrictions.minimum_amount !== null &&
    promotionCode.restrictions.minimum_amount_currency?.toLowerCase() ===
      currencyKey
  ) {
    return promotionCode.restrictions.minimum_amount;
  }

  return null;
}

function hasMinimumAmountForAnotherCurrency(
  promotionCode: Stripe.PromotionCode,
  currency: string
) {
  const currencyKey = currency.toLowerCase();
  const hasCurrentCurrencyOption =
    promotionCode.restrictions.currency_options?.[currencyKey] !== undefined;

  return (
    !hasCurrentCurrencyOption &&
    promotionCode.restrictions.minimum_amount !== null &&
    promotionCode.restrictions.minimum_amount_currency !== null &&
    promotionCode.restrictions.minimum_amount_currency.toLowerCase() !==
      currencyKey
  );
}

function isPublicPromotionCode(promotionCode: Stripe.PromotionCode) {
  return !promotionCode.customer && !promotionCode.customer_account;
}

export async function validateStripePromotionCode(
  stripe: Stripe,
  {
    code,
    subtotalAmountCents,
    currency,
    hasCompletedOrder
  }: {
    code: string;
    subtotalAmountCents: number;
    currency: string;
    hasCompletedOrder: boolean;
  }
): Promise<ValidatedPromotionCode> {
  const promotionCodes = await stripe.promotionCodes.list({
    code,
    active: true,
    limit: 10
  });
  const promotionCode = promotionCodes.data.find(isPublicPromotionCode);

  if (!promotionCode) {
    throw new CheckoutError('Invalid promotion code', 400);
  }

  const now = Math.floor(Date.now() / 1000);
  if (promotionCode.expires_at && promotionCode.expires_at <= now) {
    throw new CheckoutError('Promotion code has expired', 400);
  }

  if (
    promotionCode.max_redemptions !== null &&
    promotionCode.times_redeemed >= promotionCode.max_redemptions
  ) {
    throw new CheckoutError('Promotion code has already been redeemed', 400);
  }

  if (promotionCode.restrictions.first_time_transaction && hasCompletedOrder) {
    throw new CheckoutError(
      'Promotion code is only available for first-time customers',
      400
    );
  }

  if (hasMinimumAmountForAnotherCurrency(promotionCode, currency)) {
    throw new CheckoutError(
      'Promotion code is not valid for this currency',
      400
    );
  }

  const minimumAmountCents = getMinimumAmountCents(promotionCode, currency);
  if (minimumAmountCents !== null && subtotalAmountCents < minimumAmountCents) {
    throw new CheckoutError(
      'Promotion code requires a higher order subtotal',
      400
    );
  }

  return {
    id: promotionCode.id,
    code: promotionCode.code
  };
}
