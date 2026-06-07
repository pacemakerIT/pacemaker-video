import { afterEach, describe, expect, it } from 'vitest';
import {
  buildCheckoutSuccessUrl,
  getAppBaseUrl,
  getMetadataValue,
  getTrimmedEnv,
  toAbsoluteUrl
} from '../checkout-utils';

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe('checkout utils', () => {
  it('trims environment values and returns an empty string for missing keys', () => {
    process.env.STRIPE_EDGE_TEST_VALUE = '  value-with-space  \n';

    expect(getTrimmedEnv('STRIPE_EDGE_TEST_VALUE')).toBe('value-with-space');
    expect(getTrimmedEnv('STRIPE_EDGE_TEST_MISSING')).toBe('');
  });

  it('prefers configured app URL over request origin', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://video.pacemakercareer.com';
    const request = {
      headers: new Headers({ origin: 'http://localhost:3000' })
    } as Request;

    expect(getAppBaseUrl(request)).toBe('https://video.pacemakercareer.com');
  });

  it('uses request origin when no configured app URL exists', () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_URL;

    const request = {
      headers: new Headers({ origin: 'http://localhost:3000' })
    } as Request;

    expect(getAppBaseUrl(request)).toBe('http://localhost:3000');
  });

  it('normalizes bare Vercel hostnames to https URLs', () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.VERCEL_URL = 'pacemaker-video-git-test.vercel.app';

    expect(getAppBaseUrl()).toBe('https://pacemaker-video-git-test.vercel.app');
  });

  it('throws when no base URL source is configured', () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_URL;

    expect(() => getAppBaseUrl()).toThrow('Missing app base URL configuration');
  });

  it('preserves the literal Stripe session placeholder in success URLs', () => {
    expect(
      buildCheckoutSuccessUrl(
        'http://localhost:3000',
        '/mypage/payment-success?from=checkout'
      )
    ).toBe(
      'http://localhost:3000/mypage/payment-success?from=checkout&session_id={CHECKOUT_SESSION_ID}'
    );
  });

  it('builds absolute URLs from app paths', () => {
    expect(
      toAbsoluteUrl('https://video.pacemakercareer.com', '/payment/cancel')
    ).toBe('https://video.pacemakercareer.com/payment/cancel');
  });

  it('normalizes metadata values to Stripe-safe length', () => {
    expect(getMetadataValue(null)).toBe('');
    expect(getMetadataValue('  hello  ')).toBe('hello');
    expect(getMetadataValue('x'.repeat(600))).toHaveLength(500);
  });
});
