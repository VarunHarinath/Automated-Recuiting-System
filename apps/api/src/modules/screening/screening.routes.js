import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/authorize.js';
import { getScreeningController,overrideScreeningController } from './screening.controller.js';
export const screeningRouter=Router();screeningRouter.use(authenticate,requireRole(UserRole.ADMINISTRATOR,UserRole.RECRUITER));screeningRouter.get('/:id',getScreeningController);screeningRouter.patch('/:id/override',overrideScreeningController);
