import { prisma } from './client.js';

export interface DatabaseHealth {
  status: 'ok' | 'error';
  latencyMs: number;
}

export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  const startedAt = performance.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', latencyMs: Math.round(performance.now() - startedAt) };
  } catch {
    return { status: 'error', latencyMs: Math.round(performance.now() - startedAt) };
  }
}
