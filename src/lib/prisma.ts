import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient;
  pgPool?: Pool;
};

const pgPool =
  globalForPrisma.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL
  });

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter: new PrismaPg(pgPool),
    log: ['query']
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pgPool = pgPool;
}

export default prisma;
