import { app } from './app.js';
import { environment } from './config/environment.js';
app.listen(environment.API_PORT, environment.API_HOST, () =>
  console.info(`API listening at http://${environment.API_HOST}:${environment.API_PORT}`),
);
