export function accountErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'errors' in error) {
    const errors = error.errors;
    if (Array.isArray(errors)) {
      const first = errors[0];
      if (first && typeof first === 'object') {
        if (typeof first.longMessage === 'string') return first.longMessage;
        if (typeof first.message === 'string') return first.message;
      }
    }
  }
  return error instanceof Error ? error.message : fallback;
}
