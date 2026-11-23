const DEFAULT_CURRENCY = 'CAD';
const DEFAULT_LOCALE = 'en-CA';

export function amountToCents(amount: number) {
  return Math.round(amount * 100);
}

export function formatMoneyFromCents(
  cents: number,
  currency = DEFAULT_CURRENCY,
  locale = DEFAULT_LOCALE
) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.toUpperCase()
  }).format(cents / 100);
}

/**
 * Display price for lists, cards and detail pages (DB stores a plain number).
 * Whole amounts drop the cents ("$2,800"); fractional amounts keep two
 * decimals ("$2,799.50"). Checkout totals use formatMoneyFromCents instead.
 */
export function formatPrice(
  price: number | string | null | undefined,
  locale = DEFAULT_LOCALE
) {
  const amount =
    typeof price === 'number'
      ? price
      : Number(String(price ?? '').replace(/[^0-9.-]/g, ''));
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const hasCents = Math.round(safeAmount * 100) % 100 !== 0;

  return `$${new Intl.NumberFormat(locale, {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2
  }).format(safeAmount)}`;
}
