import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react({
      babel: {
        plugins: ['styled-jsx/babel']
      }
    })
  ],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.tsx'],
    pool: 'forks',
    server: {
      deps: {
        inline: ['parse5', 'jsdom']
      }
    }
  },
  define: {
    global: 'globalThis'
  }
});
