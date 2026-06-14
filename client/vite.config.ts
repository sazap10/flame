import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Keep the CRA-compatible output directory so the Docker build, which moves
    // ./client/build/* into the backend's public/, keeps working unchanged.
    outDir: 'build',
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
