import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { environment } from './config/environment.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { userRouter } from './modules/users/user.routes.js';
import { healthRouter } from './routes/health.js';

export const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: environment.WEB_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use(notFoundHandler);
app.use(errorHandler);
