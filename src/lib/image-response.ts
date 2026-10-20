const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

type ImageReadResult =
  | { ok: true; body: Uint8Array; contentType: string }
  | { ok: false; status: 413 | 415 };

export async function readImageResponse(
  response: Response,
  maxBytes = MAX_IMAGE_BYTES
): Promise<ImageReadResult> {
  const contentType = response.headers.get('Content-Type')?.trim() || '';
  const normalizedType = contentType.toLowerCase().split(';', 1)[0];
  if (
    !normalizedType.startsWith('image/') ||
    normalizedType === 'image/svg+xml'
  ) {
    await response.body?.cancel();
    return { ok: false, status: 415 };
  }

  const contentLengthHeader = response.headers.get('Content-Length');
  const contentLength = contentLengthHeader ? Number(contentLengthHeader) : NaN;
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    await response.body?.cancel();
    return { ok: false, status: 413 };
  }

  if (!response.body) {
    return { ok: true, body: new Uint8Array(), contentType };
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      await reader.cancel();
      return { ok: false, status: 413 };
    }
    chunks.push(value);
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return { ok: true, body, contentType };
}
