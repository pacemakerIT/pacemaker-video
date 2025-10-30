import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    globals: true,
    environment: 'happy-dom', // Switch from jsdom to happy-dom
    setupFiles: ['./vitest.setup.ts'],
    pool: 'forks'
  },
  define: {
    global: 'globalThis'
  }
});
