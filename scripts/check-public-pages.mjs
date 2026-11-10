import { isStorageObjectKey } from './thumbnail-storage-paths.mjs';

// Read-only smoke check of a deployed site's public pages: list pages,
// public APIs, every course/ebook/workshop detail page, and every thumbnail
// through the image proxy. Exits with 1 when anything fails.
//
//   npm run check:public-pages -- --base-url=https://www.paceupcareer.com

function argValue(name) {
  const prefix = `--${name}=`;
  return process.argv
    .find((value) => value.startsWith(prefix))
    ?.slice(prefix.length);
}

const baseUrl = argValue('base-url')?.replace(/\/$/, '');
if (!baseUrl) {
  throw new Error(
    '--base-url is required, e.g. --base-url=https://www.paceupcareer.com'
  );
}

// Same rule as resolveImageProxyPath in src/lib/image-url.ts.
function imagePath(value) {
  if (value.startsWith('/')) return value;
  return isStorageObjectKey(value)
    ? `/api/images/proxy?fileName=${encodeURIComponent(value)}`
    : `/api/images/proxy?url=${encodeURIComponent(value)}`;
}

const failures = [];
let checked = 0;

async function check(label, path, expectType) {
  checked += 1;
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      redirect: 'follow',
      signal: AbortSignal.timeout(20000)
    });
    const type = response.headers.get('content-type') ?? '';
    if (!response.ok) {
      failures.push(`${label}: HTTP ${response.status} ${path}`);
    } else if (expectType && !type.startsWith(expectType)) {
      failures.push(`${label}: expected ${expectType}, got ${type} ${path}`);
    }
    return response.ok && type.includes('json') ? response.json() : null;
  } catch (error) {
    failures.push(`${label}: ${error.name} ${path}`);
    return null;
  }
}

function asList(body, key) {
  if (Array.isArray(body)) return body;
  return Array.isArray(body?.[key]) ? body[key] : [];
}

for (const path of ['/', '/courses', '/ebooks', '/workshops']) {
  await check(`Page ${path}`, path, 'text/html');
}

const sections = [
  { name: 'courses', api: '/api/courses' },
  { name: 'ebooks', api: '/api/ebooks' },
  { name: 'workshops', api: '/api/workshops' }
];

for (const { name, api } of sections) {
  const items = asList(
    await check(`API ${api}`, api, 'application/json'),
    name
  );
  if (items.length === 0) failures.push(`API ${api}: no items`);

  for (const item of items) {
    await check(`${name} ${item.id} page`, `/${name}/${item.id}`, 'text/html');
    if (item.thumbnail) {
      await check(
        `${name} ${item.id} thumbnail`,
        imagePath(item.thumbnail),
        'image/'
      );
    } else {
      failures.push(`${name} ${item.id}: no thumbnail`);
    }
  }
}

for (const failure of failures) console.log(`FAIL  ${failure}`);
console.log(
  `\nChecked ${checked} request(s) on ${baseUrl}: ${failures.length} failure(s).`
);
process.exitCode = failures.length > 0 ? 1 : 0;
