// Same limit as MAX_IMAGE_UPLOAD_BYTES in src/lib/image-upload-limits.ts.
export const MAX_IMAGE_UPLOAD_BYTES = 4 * 1024 * 1024;

const CONTENT_TYPES = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp'
};

// Checks the replacement file and decides whether the old storage object can
// be deleted. Returns { ok: false, reason } when the replacement must not run.
export function planThumbnailReplacement({
  newFileName,
  newFileBytes,
  oldLocation,
  oldObjectExists,
  otherReferences
}) {
  const extension = newFileName.split('.').pop()?.toLowerCase() ?? '';
  const contentType = CONTENT_TYPES[extension];

  if (!contentType) {
    return {
      ok: false,
      reason: 'The new image must be a .png, .jpg, .jpeg, or .webp file.'
    };
  }

  if (newFileBytes > MAX_IMAGE_UPLOAD_BYTES) {
    return { ok: false, reason: 'The new image must be 4MB or smaller.' };
  }

  let keepReason = null;
  if (!oldLocation) {
    keepReason = 'the current thumbnail is not a stored object';
  } else if (!oldObjectExists) {
    keepReason = 'the current object was not found in storage';
  } else if (otherReferences > 0) {
    keepReason = `${otherReferences} other record(s) still use it`;
  }

  return {
    ok: true,
    extension: extension === 'jpeg' ? 'jpg' : extension,
    contentType,
    deleteOldObject: keepReason === null,
    keepReason
  };
}
