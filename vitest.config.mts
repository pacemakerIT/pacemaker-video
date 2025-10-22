import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    server: {
      deps: {
        inline: ['parse5', 'jsdom']
      }
    },
    pool: 'forks',
    environmentOptions: {
      jsdom: {
        resources: 'usable'
      }
    }
  },
  define: {
    global: 'globalThis'
  }
});
