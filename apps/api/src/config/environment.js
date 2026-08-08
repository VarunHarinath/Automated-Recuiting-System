import { apiEnvironmentSchema } from '@ars/config';
export const environment = apiEnvironmentSchema.parse(process.env);

export const jwtSecret = environment.JWT_SECRET ?? 'test-only-jwt-secret-do-not-use-outside-tests';
