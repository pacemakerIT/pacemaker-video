// Uploaded images (thumbnails, main visuals, instructor photos) larger than
// this are rejected. A 10MB thumbnail broke Vercel image optimization at large
// widths, and Vercel functions refuse request bodies over 4.5MB anyway.
export const MAX_IMAGE_UPLOAD_BYTES = 4 * 1024 * 1024;

export const IMAGE_UPLOAD_TOO_LARGE_MESSAGE =
  '이미지는 4MB 이하만 올릴 수 있습니다.';

export function isImageUploadTooLarge(file: { size: number }) {
  return file.size > MAX_IMAGE_UPLOAD_BYTES;
}
