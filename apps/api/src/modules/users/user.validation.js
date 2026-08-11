import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { ApiError } from '../../lib/api-error.js';

const nameSchema = z.string().trim().min(1).max(100);
const emailSchema = z.string().trim().email().max(254);
const passwordSchema = z.string().min(8).max(128);

export const userIdParamsSchema = z.object({ id: z.string().uuid() }).strict();

export const userListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    role: z.nativeEnum(UserRole).optional(),
    isActive: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
    search: z.string().trim().min(1).max(100).optional(),
  })
  .strict();

export const userCreateSchema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    role: z.nativeEnum(UserRole),
    isActive: z.boolean().optional(),
  })
  .strict();

export const userUpdateSchema = z
  .object({
    firstName: nameSchema.optional(),
    lastName: nameSchema.optional(),
    email: emailSchema.optional(),
    role: z.nativeEnum(UserRole).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, { message: 'At least one field must be provided.' });

export const userStatusSchema = z.object({ isActive: z.boolean() }).strict();

export function parseInput(schema, input) {
  const parsed = schema.safeParse(input);
  if (parsed.success) return parsed.data;
  throw new ApiError(
    400,
    'VALIDATION_ERROR',
    'The submitted data is invalid.',
    parsed.error.issues.map(({ path, message }) => ({ field: path.join('.'), message })),
  );
}
