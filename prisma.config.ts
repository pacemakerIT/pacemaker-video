import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const datasourceUrl =
  process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim();

if (!datasourceUrl) {
  throw new Error(
    'Either DIRECT_URL or DATABASE_URL must be set for Prisma commands.'
  );
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts'
  },
  datasource: {
    url: datasourceUrl
  }
});
