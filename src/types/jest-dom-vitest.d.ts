// Vitest 5 changed `Assertion<T>` to `Assertion<R, T>`, so the augmentation in
// `@testing-library/jest-dom/vitest` no longer merges and its matchers are
// missing from `expect(...)`. Merge them into Vitest's `Matchers` instead.
// Remove once jest-dom ships Vitest 5 types:
// https://github.com/testing-library/jest-dom/issues/738
import 'vitest';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare module 'vitest' {
  // Declaration merging needs an empty body; the type params must match Vitest's.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Matchers<
    R extends void | Promise<void> = void | Promise<void>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    T = unknown
  > extends TestingLibraryMatchers<unknown, R> {}
}
