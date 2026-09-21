const STORAGE_OBJECT_KEY_PATTERN = /^[^/?#]+(?:\/[^/?#]+)*\.[a-z0-9]+$/i;

export function isStorageObjectKey(value: string) {
  return (
    STORAGE_OBJECT_KEY_PATTERN.test(value) &&
    !value.startsWith('/') &&
    !value.startsWith('blob:') &&
    !/^https?:\/\//i.test(value)
  );
}

export function resolveImageProxyPath(value: string) {
  if (isStorageObjectKey(value)) {
    return `/api/images/proxy?fileName=${encodeURIComponent(value)}`;
  }

  return `/api/images/proxy?url=${encodeURIComponent(value)}`;
}
