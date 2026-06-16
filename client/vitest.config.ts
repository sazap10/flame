import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

// Vitest-only config. Kept separate from vite.config.ts so the production Docker
// build (npm install --production, which omits vitest) can load the Vite config
// without resolving vitest. Vitest picks this file up over vite.config.ts.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      // Component tests run in a simulated DOM and load the jest-dom matchers /
      // cleanup from the setup file.
      environment: 'jsdom',
      setupFiles: './src/testing/setup.ts',
      css: true,
      restoreMocks: true,
    },
  })
);
