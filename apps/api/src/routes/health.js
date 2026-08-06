import { Router } from 'express';
import { sendSuccess } from '../lib/responses.js';
export const healthRouter = Router();
healthRouter.get('/', (_request, response) => sendSuccess(response, { status: 'ok', service: 'api' }));
