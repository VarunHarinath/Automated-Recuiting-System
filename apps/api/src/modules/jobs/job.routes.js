import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/authorize.js';
import { createJobController, getJobController, listJobsController, updateJobController, updateJobStatusController } from './job.controller.js';
import { rankingsController } from '../screening/screening.controller.js';

export const jobRouter = Router();
jobRouter.use(authenticate);
jobRouter.get('/', listJobsController);
jobRouter.get('/:id', getJobController);
jobRouter.get('/:id/rankings', requireRole(UserRole.ADMINISTRATOR, UserRole.RECRUITER), rankingsController);
jobRouter.post('/', requireRole(UserRole.ADMINISTRATOR, UserRole.RECRUITER), createJobController);
jobRouter.patch('/:id/status', requireRole(UserRole.ADMINISTRATOR, UserRole.RECRUITER), updateJobStatusController);
jobRouter.patch('/:id', requireRole(UserRole.ADMINISTRATOR, UserRole.RECRUITER), updateJobController);
