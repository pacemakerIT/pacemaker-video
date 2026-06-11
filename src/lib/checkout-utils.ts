export function getTrimmedEnv(name: string): string {
  return process.env[name]?.trim() ?? '';
}

export function getAppBaseUrl(req?: Request): string {
  const configuredUrl =
    getTrimmedEnv('NEXT_PUBLIC_APP_URL') ||
    getTrimmedEnv('NEXT_PUBLIC_SITE_URL');

  const fallbackUrl =
    configuredUrl ||
    req?.headers.get('origin')?.trim() ||
    getTrimmedEnv('VERCEL_URL');

  if (!fallbackUrl) {
    throw new Error('Missing app base URL configuration');
  }

  if (fallbackUrl.startsWith('http://') || fallbackUrl.startsWith('https://')) {
    return fallbackUrl;
  }

  return `https://${fallbackUrl}`;
}

export function getMetadataValue(value: string | number | null | undefined) {
  return String(value ?? '')
    .trim()
    .slice(0, 500);
}

export function toAbsoluteUrl(baseUrl: string, path: string): string {
  return new URL(path, baseUrl).toString();
}

export function buildCheckoutSuccessUrl(
  baseUrl: string,
  successPath: string
): string {
  const sessionPlaceholder = '{CHECKOUT_SESSION_ID}';
  const successUrl = new URL(successPath, baseUrl);
  successUrl.searchParams.set('session_id', sessionPlaceholder);

  return successUrl
    .toString()
    .replace(encodeURIComponent(sessionPlaceholder), sessionPlaceholder);
}
