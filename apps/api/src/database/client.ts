import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const queryLoggingEnabled = process.env.NODE_ENV === 'development' && process.env.PRISMA_LOG_QUERIES === 'true';

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: queryLoggingEnabled ? ['query', 'warn', 'error'] : ['warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
