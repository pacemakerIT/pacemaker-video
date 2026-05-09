import { loadEnvConfig } from '@next/env';
import { defineConfig } from 'prisma/config';

// Load .env.local/.env with the same precedence Next.js uses.
loadEnvConfig(process.cwd());

const datasourceUrl =
  process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim() || '';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts'
  },
  datasource: {
    // Keep generate usable in hooks/CI without DB secrets.
    // Commands that actually need a database connection will still fail.
    url: datasourceUrl
  }
});
