import { z } from 'zod';
import { parseInput } from '../users/user.validation.js';
export const resumeIdSchema = z.object({ id: z.string().uuid() }).strict();
export { parseInput };
