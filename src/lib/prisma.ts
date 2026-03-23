import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient;
  pgPool?: Pool;
};

function getPrismaClient() {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const connectionString =
    process.env.DATABASE_URL?.trim() || process.env.DIRECT_URL?.trim();

  if (!connectionString) {
    throw new Error(
      'Either DATABASE_URL or DIRECT_URL must be set for Prisma client.'
    );
  }

  const pgPool =
    globalForPrisma.pgPool ??
    new Pool({
      connectionString
    });

  const prisma = new PrismaClient({
    adapter: new PrismaPg(pgPool),
    log: ['query']
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
    globalForPrisma.pgPool = pgPool;
  }

  return prisma;
}

const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient() as PrismaClient &
      Record<PropertyKey, unknown>;
    const value = Reflect.get(client as object, prop, client);
    return typeof value === 'function' ? value.bind(client) : value;
  }
});

export default prisma;
