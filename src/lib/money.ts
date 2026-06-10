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
