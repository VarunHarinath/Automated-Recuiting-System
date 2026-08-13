import { z } from 'zod';
import { parseInput } from '../users/user.validation.js';
const uuid=z.string().uuid();
export const idSchema=z.object({id:uuid}).strict();
export const rankingSchema=z.object({id:uuid}).strict();
export const overrideSchema=z.object({recommendation:z.string().trim().min(1).max(100),reason:z.string().trim().min(1).max(2000)}).strict();
export {parseInput};
