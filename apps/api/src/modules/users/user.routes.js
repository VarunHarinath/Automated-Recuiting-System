import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/authorize.js';
import {
  createUserController,
  getUserController,
  listUsersController,
  updateUserController,
  updateUserStatusController,
} from './user.controller.js';

export const userRouter = Router();

userRouter.use(authenticate, requireRole(UserRole.ADMINISTRATOR));
userRouter.get('/', listUsersController);
userRouter.get('/:id', getUserController);
userRouter.post('/', createUserController);
userRouter.patch('/:id/status', updateUserStatusController);
userRouter.patch('/:id', updateUserController);
