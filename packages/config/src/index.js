import { z } from 'zod';

export const nodeEnvironmentSchema = z.enum(['development', 'test', 'production']);
export const apiEnvironmentSchema = z
  .object({
    NODE_ENV: nodeEnvironmentSchema.default('development'),
    API_PORT: z.coerce.number().int().positive().max(65535).default(3000),
    API_HOST: z.string().default('127.0.0.1'),
    WEB_ORIGIN: z.string().url().default('http://localhost:5173'),
    RESUME_SERVICE_URL: z.string().url().default('http://localhost:8000'),
    JWT_SECRET: z.string().min(32).optional(),
    JWT_EXPIRES_IN: z.string().min(1).default('15m'),
  })
  .superRefine((value, context) => {
    if (value.NODE_ENV !== 'test' && !value.JWT_SECRET) {
      context.addIssue({
        code: 'custom',
        path: ['JWT_SECRET'],
        message: 'JWT_SECRET is required outside the test environment.',
      });
    }
  });
