import { disconnectDatabase } from './client.js';

export function registerDatabaseShutdown(): void {
  const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
    console.info(`Received ${signal}; closing database connections.`);
    await disconnectDatabase();
    process.exit(0);
  };
  process.once('SIGINT', () => void shutdown('SIGINT'));
  process.once('SIGTERM', () => void shutdown('SIGTERM'));
}
