import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { recordApplicationStatusChange, recordCommunicationOutcome } from '../../src/database/rules.js';

const prisma = new PrismaClient();
let recruiterId: string;
let interviewerId: string;
let candidateId: string;
let jobId: string;

async function expectConstraint(operation: () => Promise<unknown>): Promise<void> {
  await expect(operation()).rejects.toThrow();
}

beforeAll(async () => {
  recruiterId = randomUUID(); interviewerId = randomUUID(); candidateId = randomUUID(); jobId = randomUUID();
  await prisma.user.createMany({ data: [
    { id: recruiterId, firstName: 'Test', lastName: 'Recruiter', email: `recruiter-${recruiterId}@test.local`, passwordHash: 'test-only-hash', role: 'RECRUITER' },
    { id: interviewerId, firstName: 'Test', lastName: 'Interviewer', email: `interviewer-${interviewerId}@test.local`, passwordHash: 'test-only-hash', role: 'INTERVIEWER' },
  ] });
  await prisma.candidate.create({ data: { id: candidateId, firstName: 'Test', lastName: 'Candidate', email: `candidate-${candidateId}@test.local`, normalizedEmail: `candidate-${candidateId}@test.local` } });
  await prisma.job.create({ data: { id: jobId, title: 'Database Test Job', department: 'QA', description: 'Database constraint test fixture.', location: 'Remote', employmentType: 'FULL_TIME', minimumExperienceYears: 1, status: 'OPEN', createdById: recruiterId } });
});

afterAll(async () => prisma.$disconnect());

describe('database integrity foundation', () => {
  it('DB-01 enforces unique user email', async () => {
    const email = `unique-${randomUUID()}@test.local`;
    await prisma.user.create({ data: { firstName: 'First', lastName: 'User', email, passwordHash: 'hash', role: 'RECRUITER' } });
    await expectConstraint(() => prisma.user.create({ data: { firstName: 'Second', lastName: 'User', email, passwordHash: 'hash', role: 'RECRUITER' } }));
  });

  it('DB-02 enforces unique job code', async () => {
    const code = `JOB-TEST-${randomUUID()}`;
    const data = { jobCode: code, title: 'Unique Code', department: 'QA', description: 'Test', location: 'Remote', employmentType: 'FULL_TIME' as const, minimumExperienceYears: 0, createdById: recruiterId };
    await prisma.job.create({ data });
    await expectConstraint(() => prisma.job.create({ data }));
  });

  it('DB-03 enforces one application per candidate/job', async () => {
    const first = await prisma.application.create({ data: { candidateId, jobId, assignedRecruiterId: recruiterId } });
    await expectConstraint(() => prisma.application.create({ data: { candidateId, jobId } }));
    expect(first.currentStatus).toBe('APPLIED');
  });

  it('DB-04 permits one candidate to apply to different jobs', async () => {
    const secondJob = await prisma.job.create({ data: { title: 'Second Job', department: 'QA', description: 'Test', location: 'Remote', employmentType: 'CONTRACT', minimumExperienceYears: 0, createdById: recruiterId } });
    const application = await prisma.application.create({ data: { candidateId, jobId: secondJob.id } });
    expect(application.candidateId).toBe(candidateId);
  });

  it('DB-05 creates application status history transactionally', async () => {
    const app = await prisma.application.findFirstOrThrow({ where: { candidateId, jobId } });
    await recordApplicationStatusChange(prisma, { applicationId: app.id, changedById: recruiterId, newStatus: 'SCREENING', reason: 'Test transition' });
    const history = await prisma.applicationStatusHistory.findFirstOrThrow({ where: { applicationId: app.id }, orderBy: { createdAt: 'desc' } });
    expect(history).toMatchObject({ previousStatus: 'APPLIED', newStatus: 'SCREENING' });
  });

  it('DB-06 preserves multiple screening results for re-screening', async () => {
    const app = await prisma.application.findFirstOrThrow({ where: { candidateId, jobId } });
    const resume = await prisma.resume.create({ data: { candidateId, originalFileName: 'test.pdf', storedFileName: `${randomUUID()}.pdf`, storageKey: `tests/${randomUUID()}.pdf`, mimeType: 'application/pdf', fileSize: 100n, checksum: randomUUID(), uploadedById: recruiterId } });
    const config = await prisma.screeningConfiguration.create({ data: { name: `Test Config ${randomUUID()}`, skillsWeight: 50, experienceWeight: 25, educationWeight: 15, preferredCriteriaWeight: 10, isDefault: false, createdById: recruiterId } });
    const base = { applicationId: app.id, resumeId: resume.id, configurationId: config.id, skillsScore: 80, experienceScore: 70, educationScore: 60, preferredCriteriaScore: 50, matchedSkills: [], missingRequiredSkills: [], summary: 'Test screening.' };
    await prisma.screeningResult.create({ data: { ...base, totalScore: 70 } });
    await prisma.screeningResult.create({ data: { ...base, totalScore: 75 } });
    expect(await prisma.screeningResult.count({ where: { applicationId: app.id } })).toBe(2);
  });

  it('DB-07 prevents duplicate interviewer assignment', async () => {
    const app = await prisma.application.findFirstOrThrow({ where: { candidateId, jobId } });
    const interview = await prisma.interview.create({ data: { applicationId: app.id, roundNumber: 1, mode: 'VIDEO', scheduledStart: new Date('2030-01-01T10:00:00Z'), scheduledEnd: new Date('2030-01-01T11:00:00Z'), timezone: 'UTC', meetingLink: 'https://example.test/meeting', createdById: recruiterId } });
    await prisma.interviewInterviewer.create({ data: { interviewId: interview.id, interviewerId } });
    await expectConstraint(() => prisma.interviewInterviewer.create({ data: { interviewId: interview.id, interviewerId } }));
  });

  it('DB-08 permits one feedback record per interviewer/interview', async () => {
    const assignment = await prisma.interviewInterviewer.findFirstOrThrow({ where: { interviewerId } });
    const data = { interviewId: assignment.interviewId, interviewerId, overallRating: 4, recommendation: 'HIRE' as const };
    await prisma.interviewFeedback.create({ data });
    await expectConstraint(() => prisma.interviewFeedback.create({ data }));
  });

  it('DB-09 rejects invalid job experience ranges', async () => {
    await expectConstraint(() => prisma.job.create({ data: { title: 'Invalid Range', department: 'QA', description: 'Test', location: 'Remote', employmentType: 'FULL_TIME', minimumExperienceYears: 5, maximumExperienceYears: 2, createdById: recruiterId } }));
  });

  it('DB-10 rejects interview end time before start time', async () => {
    const app = await prisma.application.findFirstOrThrow({ where: { candidateId, jobId } });
    await expectConstraint(() => prisma.interview.create({ data: { applicationId: app.id, roundNumber: 2, mode: 'PHONE', scheduledStart: new Date('2030-01-02T11:00:00Z'), scheduledEnd: new Date('2030-01-02T10:00:00Z'), timezone: 'UTC', createdById: recruiterId } }));
  });

  it('DB-11 communication failure does not alter application status', async () => {
    const app = await prisma.application.findFirstOrThrow({ where: { candidateId, jobId } });
    const communication = await prisma.communication.create({ data: { applicationId: app.id, candidateId, type: 'GENERAL', status: 'DRAFT', recipientEmail: 'candidate@test.local', subject: 'Test', renderedBody: 'Test message.', sentById: recruiterId } });
    const before = app.currentStatus;
    await recordCommunicationOutcome(prisma, communication.id, 'FAILED', 'Simulated provider failure');
    expect((await prisma.application.findUniqueOrThrow({ where: { id: app.id } })).currentStatus).toBe(before);
  });

  it('DB-12 permits system audit events without an actor', async () => {
    const audit = await prisma.auditLog.create({ data: { actorUserId: null, action: 'TEST_SYSTEM_EVENT', entityType: 'SYSTEM', entityId: randomUUID() } });
    expect(audit.actorUserId).toBeNull();
  });
});
