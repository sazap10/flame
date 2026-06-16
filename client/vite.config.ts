import react from '@vitejs/plugin-react';
/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Keep the CRA-compatible output directory so the Docker build, which moves
    // ./client/build/* into the backend's public/, keeps working unchanged.
    outDir: 'build',
  },
  test: {
    // Component tests run in a simulated DOM and load the jest-dom matchers /
    // cleanup from the setup file.
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    restoreMocks: true,
  },
  server: {
    port: 3000,
    // Proxy API, uploads and the weather WebSocket to the backend in dev,
    // replacing the old CRA setupProxy.js.
    proxy: {
      '/api': 'http://localhost:5005',
      '/uploads': 'http://localhost:5005',
      '/socket': {
        target: 'http://localhost:5005',
        ws: true,
      },
    },
  },
});
