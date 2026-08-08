import { app } from './app.js';
import { environment } from './config/environment.js';
import { disconnectDatabase } from './database/runtime-client.js';

const server = app.listen(environment.API_PORT, environment.API_HOST, () =>
  console.info(`API listening at http://${environment.API_HOST}:${environment.API_PORT}`),
);

function shutdown(signal) {
  console.info(`Received ${signal}; closing the API and database connection.`);
  server.close(async () => {
    await disconnectDatabase();
    process.exit(0);
  });
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
