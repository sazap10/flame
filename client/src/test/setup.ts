// Vitest setup: register jest-dom matchers and unmount React trees after each
// test. Importing the /vitest entrypoint also augments Vitest's `expect` types,
// so matchers like `toBeInTheDocument()` type-check in `npm run typecheck`.
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
