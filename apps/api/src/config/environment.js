import { apiEnvironmentSchema } from '@ars/config';
export const environment = apiEnvironmentSchema.parse(process.env);
