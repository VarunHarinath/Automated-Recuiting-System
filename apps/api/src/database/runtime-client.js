import { PrismaClient } from '@prisma/client';

const queryLoggingEnabled = process.env.NODE_ENV === 'development' && process.env.PRISMA_LOG_QUERIES === 'true';

export const prisma = globalThis.prisma ?? new PrismaClient({
  log: queryLoggingEnabled ? ['query', 'warn', 'error'] : ['warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

export async function disconnectDatabase() {
  await prisma.$disconnect();
}
