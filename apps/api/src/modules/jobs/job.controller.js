import { sendSuccess } from '../../lib/responses.js';
import { createJob, getJob, listJobs, updateJob, updateJobStatus } from './job.service.js';
import { jobCreateSchema, jobIdSchema, jobListSchema, jobStatusSchema, jobUpdateSchema, parseInput } from './job.validation.js';

const actor = (request) => ({ ...request.auth, ipAddress: request.ip, userAgent: request.get('user-agent') });
export async function createJobController(req, res) { return sendSuccess(res, await createJob(parseInput(jobCreateSchema, req.body), actor(req)), 201); }
export async function listJobsController(req, res) { const result = await listJobs(parseInput(jobListSchema, req.query)); return sendSuccess(res, result.jobs, 200, result.meta); }
export async function getJobController(req, res) { return sendSuccess(res, await getJob(parseInput(jobIdSchema, req.params).id)); }
export async function updateJobController(req, res) { const { id } = parseInput(jobIdSchema, req.params); return sendSuccess(res, await updateJob(id, parseInput(jobUpdateSchema, req.body), actor(req))); }
export async function updateJobStatusController(req, res) { const { id } = parseInput(jobIdSchema, req.params); const { status } = parseInput(jobStatusSchema, req.body); return sendSuccess(res, await updateJobStatus(id, status, actor(req))); }
