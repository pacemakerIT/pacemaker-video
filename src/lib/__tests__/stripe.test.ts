import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const stripeConstructorMock = vi.fn(function StripeMock(apiKey: string) {
    return { apiKey };
  });

  return { stripeConstructorMock };
});

vi.mock('stripe', () => ({
  default: mocks.stripeConstructorMock
}));

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.resetModules();
  vi.clearAllMocks();
});

describe('Stripe client bootstrap', () => {
  it('throws when STRIPE_SECRET_KEY is missing or blank', async () => {
    process.env.STRIPE_SECRET_KEY = '  \n';
    const { getStripeClient } = await import('../stripe');

    expect(() => getStripeClient()).toThrow(
      'Missing STRIPE_SECRET_KEY configuration'
    );
    expect(mocks.stripeConstructorMock).not.toHaveBeenCalled();
  });

  it('trims STRIPE_SECRET_KEY and caches the client', async () => {
    process.env.STRIPE_SECRET_KEY = '  sk_test_trimmed  \n';
    const { getStripeClient } = await import('../stripe');

    const firstClient = getStripeClient();
    const secondClient = getStripeClient();

    expect(mocks.stripeConstructorMock).toHaveBeenCalledTimes(1);
    expect(mocks.stripeConstructorMock).toHaveBeenCalledWith('sk_test_trimmed');
    expect(firstClient).toBe(secondClient);
    expect(firstClient).toEqual({ apiKey: 'sk_test_trimmed' });
  });
});
