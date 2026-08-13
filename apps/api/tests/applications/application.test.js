import { randomUUID } from 'node:crypto';
import argon2 from 'argon2';
import { UserRole } from '@prisma/client';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { prisma } from '../../src/database/runtime-client.js';
import { signAccessToken } from '../../src/modules/auth/auth.jwt.js';

const run = randomUUID();
let users;
let tokens;
let candidate;
let secondCandidate;
let openJob;
let secondJob;
let closedJob;
let application;

beforeAll(async () => {
  const passwordHash = await argon2.hash('ApplicationTest!123');
  users = {};
  tokens = {};
  for (const role of Object.values(UserRole)) {
    const user = await prisma.user.create({ data: { firstName: 'App', lastName: role, email: `app-${role}-${run}@test.local`, passwordHash, role } });
    users[role] = user;
    tokens[role] = signAccessToken(user);
  }
  candidate = await prisma.candidate.create({ data: { firstName: 'Application', lastName: 'Candidate', email: `candidate-${run}@test.local`, normalizedEmail: `candidate-${run}@test.local` } });
  secondCandidate = await prisma.candidate.create({ data: { firstName: 'Second', lastName: 'Candidate', email: `candidate2-${run}@test.local`, normalizedEmail: `candidate2-${run}@test.local` } });
  const jobData = { department: 'Engineering', description: 'Application test job.', location: 'Chicago', employmentType: 'FULL_TIME', minimumExperienceYears: 0, createdById: users.RECRUITER.id };
  openJob = await prisma.job.create({ data: { ...jobData, title: `Open ${run}` } });
  secondJob = await prisma.job.create({ data: { ...jobData, title: `Second ${run}` } });
  closedJob = await prisma.job.create({ data: { ...jobData, title: `Closed ${run}`, status: 'CLOSED', closedAt: new Date() } });
});

afterAll(() => prisma.$disconnect());
const auth = (role = UserRole.RECRUITER) => ({ Authorization: `Bearer ${tokens[role]}` });
const create = (role = UserRole.RECRUITER, data = {}) => request(app).post('/api/v1/applications').set(auth(role)).send({ candidateId: candidate.id, jobId: openJob.id, assignedRecruiterId: users.RECRUITER.id, source: 'MANUAL', ...data });

describe.sequential('Application Management API', () => {
  it('APP-01 recruiter creates application', async () => { const response = await create(); expect(response.status).toBe(201); application = response.body.data; });
  it('APP-02 admin creates application', async () => expect((await create(UserRole.ADMINISTRATOR, { candidateId: secondCandidate.id })).status).toBe(201));
  it('APP-03 unauthorized creation rejected', async () => expect((await create(UserRole.INTERVIEWER, { jobId: secondJob.id })).status).toBe(403));
  it('APP-04 candidate must exist', async () => { const response = await create(UserRole.RECRUITER, { candidateId: randomUUID(), jobId: secondJob.id }); expect(response.status).toBe(404); expect(response.body.error.code).toBe('CANDIDATE_NOT_FOUND'); });
  it('APP-05 job must exist', async () => { const response = await create(UserRole.RECRUITER, { candidateId: secondCandidate.id, jobId: randomUUID() }); expect(response.status).toBe(404); expect(response.body.error.code).toBe('JOB_NOT_FOUND'); });
  it('APP-06 closed job rejects application', async () => { const response = await create(UserRole.RECRUITER, { candidateId: secondCandidate.id, jobId: closedJob.id }); expect(response.status).toBe(409); expect(response.body.error.code).toBe('JOB_NOT_OPEN'); });
  it('APP-07 open job accepts application', async () => expect(application.job.status).toBe('OPEN'));
  it('APP-08 duplicate candidate/job rejected', async () => { const response = await create(); expect(response.status).toBe(409); expect(response.body.error.code).toBe('APPLICATION_ALREADY_EXISTS'); });
  it('APP-09 initial status is APPLIED', async () => expect(application.currentStatus).toBe('APPLIED'));
  it('APP-10 initial status history created', async () => expect(application.statusHistory[0]).toMatchObject({ previousStatus: null, newStatus: 'APPLIED' }));
  it('APP-11 application code unique', async () => { const codes = (await prisma.application.findMany({ where: { OR: [{ id: application.id }, { candidateId: secondCandidate.id, jobId: openJob.id }] } })).map((x) => x.applicationCode); expect(new Set(codes).size).toBe(codes.length); });
  it('APP-12 candidate can apply to another job', async () => expect((await create(UserRole.RECRUITER, { jobId: secondJob.id })).status).toBe(201));
  it('APP-13 list pagination', async () => { const response = await request(app).get('/api/v1/applications?limit=1').set(auth()); expect(response.body.data).toHaveLength(1); expect(response.body.meta.limit).toBe(1); });
  it('APP-14 filter by status', async () => { const response = await request(app).get('/api/v1/applications?status=APPLIED').set(auth()); expect(response.body.data.every((x) => x.currentStatus === 'APPLIED')).toBe(true); });
  it('APP-15 filter by job', async () => { const response = await request(app).get(`/api/v1/applications?jobId=${openJob.id}`).set(auth()); expect(response.body.data.every((x) => x.job.id === openJob.id)).toBe(true); });
  it('APP-16 filter by candidate', async () => { const response = await request(app).get(`/api/v1/applications?candidateId=${candidate.id}`).set(auth()); expect(response.body.data.every((x) => x.candidate.id === candidate.id)).toBe(true); });
  it('APP-17 filter by recruiter', async () => { const response = await request(app).get(`/api/v1/applications?assignedRecruiterId=${users.RECRUITER.id}`).set(auth()); expect(response.body.data.every((x) => x.assignedRecruiter.id === users.RECRUITER.id)).toBe(true); });
  it('APP-18 retrieve application', async () => expect((await request(app).get(`/api/v1/applications/${application.id}`).set(auth())).status).toBe(200));
  it('APP-19 missing application 404', async () => expect((await request(app).get(`/api/v1/applications/${randomUUID()}`).set(auth())).body.error.code).toBe('APPLICATION_NOT_FOUND'));
  it('APP-20 update recruiter assignment', async () => { const response = await request(app).patch(`/api/v1/applications/${application.id}`).set(auth()).send({ assignedRecruiterId: users.ADMINISTRATOR.id }); expect(response.body.data.assignedRecruiter.id).toBe(users.ADMINISTRATOR.id); });
  it('APP-21 invalid recruiter assignment rejected', async () => { const response = await request(app).patch(`/api/v1/applications/${application.id}`).set(auth()).send({ assignedRecruiterId: users.INTERVIEWER.id }); expect(response.status).toBe(400); expect(response.body.error.code).toBe('INVALID_RECRUITER_ASSIGNMENT'); });
  it('APP-22 protected fields rejected', async () => expect((await request(app).patch(`/api/v1/applications/${application.id}`).set(auth()).send({ currentStatus: 'HIRED' })).status).toBe(400));
  it('APP-23 status update works', async () => { const response = await request(app).patch(`/api/v1/applications/${application.id}/status`).set(auth()).send({ status: 'SHORTLISTED', reason: 'Meets requirements' }); expect(response.body.data.currentStatus).toBe('SHORTLISTED'); });
  it('APP-24 status history appended', async () => { const row = await prisma.application.findUniqueOrThrow({ where: { id: application.id }, include: { statusHistory: true } }); expect(row.statusHistory).toHaveLength(2); });
  it('APP-25 previous history preserved', async () => { const history = await prisma.applicationStatusHistory.findMany({ where: { applicationId: application.id }, orderBy: { createdAt: 'asc' } }); expect(history[0].newStatus).toBe('APPLIED'); expect(history[1].previousStatus).toBe('APPLIED'); });
  it('APP-26 status reason stored', async () => expect((await prisma.applicationStatusHistory.findFirstOrThrow({ where: { applicationId: application.id, newStatus: 'SHORTLISTED' } })).reason).toBe('Meets requirements'));
  it('APP-27 invalid status rejected', async () => expect((await request(app).patch(`/api/v1/applications/${application.id}/status`).set(auth()).send({ status: 'ACCEPTED' })).status).toBe(400));
  it('APP-28 status transaction consistency', async () => { const row = await prisma.application.findUniqueOrThrow({ where: { id: application.id }, include: { statusHistory: { orderBy: { createdAt: 'desc' }, take: 1 } } }); expect(row.currentStatus).toBe(row.statusHistory[0].newStatus); });
  it('APP-29 audit events created', async () => { const actions = (await prisma.auditLog.findMany({ where: { entityType: 'APPLICATION', entityId: application.id } })).map((x) => x.action); expect(actions).toEqual(expect.arrayContaining(['APPLICATION_CREATED', 'APPLICATION_UPDATED', 'APPLICATION_RECRUITER_ASSIGNED', 'APPLICATION_STATUS_CHANGED'])); });
  it('APP-30 internal note added and returned only through protected detail', async () => { const created = await request(app).post(`/api/v1/applications/${application.id}/notes`).set(auth()).send({ content: 'Internal recruiter note.' }); expect(created.status).toBe(201); const detail = await request(app).get(`/api/v1/applications/${application.id}`).set(auth()); expect(detail.body.data.notes.some((x) => x.content === 'Internal recruiter note.')).toBe(true); expect((await request(app).get(`/api/v1/applications/${application.id}`)).status).toBe(401); });
});
