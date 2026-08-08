import { z } from 'zod';

export const loginSchema = z
  .object({
    email: z.string().trim().email(),
    password: z.string().min(1),
  })
  .strict();

export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}
