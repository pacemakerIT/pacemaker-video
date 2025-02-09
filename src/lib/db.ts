import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

// This declaration extends the type of globalThis to include prismaGlobal
declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

// Use existing prismaGlobal if it exists, otherwise create a new one
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

// Optionally, in development, reset the global instance to ensure the latest schema is used
if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}
