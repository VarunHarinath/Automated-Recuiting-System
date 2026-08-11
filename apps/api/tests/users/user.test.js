import { randomUUID } from 'node:crypto';
import argon2 from 'argon2';
import { UserRole } from '@prisma/client';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { prisma } from '../../src/database/runtime-client.js';
import { signAccessToken } from '../../src/modules/auth/auth.jwt.js';

const runId = randomUUID();
const password = 'UserTests!123';
const fixtureEmails = {
  admin: `users-admin-${runId}@test.local`,
  recruiter: `users-recruiter-${runId}@test.local`,
  interviewer: `users-interviewer-${runId}@test.local`,
  inactive: `users-inactive-${runId}@test.local`,
  managed: `users-managed-${runId}@test.local`,
};
let fixtures;
let adminToken;
let recruiterToken;
let interviewerToken;
let managedUser;

function authorized(token = adminToken) {
  return { Authorization: `Bearer ${token}` };
}

beforeAll(async () => {
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  const [admin, recruiter, interviewer, inactive] = await Promise.all([
    prisma.user.create({ data: { firstName: 'UserTest', lastName: 'Admin', email: fixtureEmails.admin, passwordHash, role: UserRole.ADMINISTRATOR } }),
    prisma.user.create({ data: { firstName: 'UserTest', lastName: 'Recruiter', email: fixtureEmails.recruiter, passwordHash, role: UserRole.RECRUITER } }),
    prisma.user.create({ data: { firstName: 'UserTest', lastName: 'Interviewer', email: fixtureEmails.interviewer, passwordHash, role: UserRole.INTERVIEWER } }),
    prisma.user.create({ data: { firstName: 'SearchableInactive', lastName: runId, email: fixtureEmails.inactive, passwordHash, role: UserRole.INTERVIEWER, isActive: false } }),
  ]);
  fixtures = { admin, recruiter, interviewer, inactive };
  adminToken = signAccessToken(admin);
  recruiterToken = signAccessToken(recruiter);
  interviewerToken = signAccessToken(interviewer);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe.sequential('User Management API', () => {
  it('USER-01 administrator can list users', async () => {
    const response = await request(app).get('/api/v1/users').set(authorized());
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('USER-02 recruiter cannot list users', async () => {
    const response = await request(app).get('/api/v1/users').set(authorized(recruiterToken));
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });

  it('USER-03 interviewer cannot list users', async () => {
    const response = await request(app).get('/api/v1/users').set(authorized(interviewerToken));
    expect(response.status).toBe(403);
  });

  it('USER-04 unauthenticated request receives 401', async () => {
    const response = await request(app).get('/api/v1/users');
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('USER-05 administrator can retrieve a user', async () => {
    const response = await request(app).get(`/api/v1/users/${fixtures.recruiter.id}`).set(authorized());
    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe(fixtureEmails.recruiter);
    expect(response.body.data).not.toHaveProperty('passwordHash');
  });

  it('USER-06 nonexistent user returns USER_NOT_FOUND', async () => {
    const response = await request(app).get(`/api/v1/users/${randomUUID()}`).set(authorized());
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('USER_NOT_FOUND');
  });

  it('USER-07 administrator can create a user', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .set(authorized())
      .send({ firstName: 'Managed', lastName: 'Person', email: fixtureEmails.managed, password, role: UserRole.RECRUITER });
    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({ email: fixtureEmails.managed, role: UserRole.RECRUITER, isActive: true });
    managedUser = response.body.data;
  });

  it('USER-08 duplicate email is rejected', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .set(authorized())
      .send({ firstName: 'Duplicate', lastName: 'Person', email: fixtureEmails.managed, password, role: UserRole.RECRUITER });
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
  });

  it('USER-09 email normalization works', async () => {
    const email = `Normalize-${runId}@Example.Local`;
    const response = await request(app)
      .post('/api/v1/users')
      .set(authorized())
      .send({ firstName: 'Normalized', lastName: 'Email', email: `  ${email}  `, password, role: UserRole.INTERVIEWER });
    expect(response.status).toBe(201);
    expect(response.body.data.email).toBe(email.toLowerCase());
  });

  it('USER-10 password is Argon2-hashed before storage', async () => {
    const stored = await prisma.user.findUniqueOrThrow({ where: { id: managedUser.id } });
    expect(stored.passwordHash).not.toBe(password);
    expect(stored.passwordHash.startsWith('$argon2')).toBe(true);
    expect(await argon2.verify(stored.passwordHash, password)).toBe(true);
  });

  it('USER-11 password and passwordHash are never returned', async () => {
    const list = await request(app).get('/api/v1/users').set(authorized());
    const detail = await request(app).get(`/api/v1/users/${managedUser.id}`).set(authorized());
    expect(list.text).not.toContain('passwordHash');
    expect(detail.text).not.toContain('passwordHash');
    expect(detail.text).not.toContain(password);
  });

  it('USER-12 administrator can update a user name', async () => {
    const response = await request(app)
      .patch(`/api/v1/users/${managedUser.id}`)
      .set(authorized())
      .send({ firstName: 'Updated', lastName: 'Name' });
    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({ firstName: 'Updated', lastName: 'Name' });
  });

  it('USER-13 administrator can change a user role', async () => {
    const response = await request(app)
      .patch(`/api/v1/users/${managedUser.id}`)
      .set(authorized())
      .send({ role: UserRole.INTERVIEWER });
    expect(response.status).toBe(200);
    expect(response.body.data.role).toBe(UserRole.INTERVIEWER);
  });

  it('USER-14 invalid role is rejected', async () => {
    const response = await request(app)
      .patch(`/api/v1/users/${managedUser.id}`)
      .set(authorized())
      .send({ role: 'SUPER_ADMIN' });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('USER-15 administrator can deactivate a user', async () => {
    const response = await request(app)
      .patch(`/api/v1/users/${managedUser.id}/status`)
      .set(authorized())
      .send({ isActive: false });
    expect(response.status).toBe(200);
    expect(response.body.data.isActive).toBe(false);
  });

  it('USER-16 deactivated user can no longer authenticate', async () => {
    const response = await request(app).post('/api/v1/auth/login').send({ email: fixtureEmails.managed, password });
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('USER-17 administrator can reactivate a user', async () => {
    const response = await request(app)
      .patch(`/api/v1/users/${managedUser.id}/status`)
      .set(authorized())
      .send({ isActive: true });
    expect(response.status).toBe(200);
    expect(response.body.data.isActive).toBe(true);
  });

  it('USER-18 pagination works with metadata', async () => {
    const response = await request(app).get('/api/v1/users?page=1&limit=2').set(authorized());
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.meta).toMatchObject({ page: 1, limit: 2 });
    expect(response.body.meta.total).toBeGreaterThanOrEqual(5);
    expect(response.body.meta.totalPages).toBe(Math.ceil(response.body.meta.total / 2));
  });

  it('USER-19 role filtering works', async () => {
    const response = await request(app).get('/api/v1/users?role=RECRUITER&limit=100').set(authorized());
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data.every((user) => user.role === UserRole.RECRUITER)).toBe(true);
  });

  it('USER-20 active-status filtering works', async () => {
    const response = await request(app).get('/api/v1/users?isActive=false&limit=100').set(authorized());
    expect(response.status).toBe(200);
    expect(response.body.data.some((user) => user.id === fixtures.inactive.id)).toBe(true);
    expect(response.body.data.every((user) => user.isActive === false)).toBe(true);
  });

  it('USER-21 search works across supported user fields', async () => {
    const response = await request(app).get(`/api/v1/users?search=${runId}&limit=100`).set(authorized());
    expect(response.status).toBe(200);
    expect(response.body.data.some((user) => user.id === fixtures.inactive.id)).toBe(true);
  });

  it('USER-22 database role changes affect subsequent authorization even with an old JWT role', async () => {
    const promoted = await request(app)
      .patch(`/api/v1/users/${fixtures.recruiter.id}`)
      .set(authorized())
      .send({ role: UserRole.ADMINISTRATOR });
    expect(promoted.status).toBe(200);
    expect((await request(app).get('/api/v1/users').set(authorized(recruiterToken))).status).toBe(200);

    await request(app).patch(`/api/v1/users/${fixtures.recruiter.id}`).set(authorized()).send({ role: UserRole.RECRUITER });
    expect((await request(app).get('/api/v1/users').set(authorized(recruiterToken))).status).toBe(403);
  });

  it('USER-23 security-sensitive actions create expected audit records', async () => {
    const actions = await prisma.auditLog.findMany({ where: { entityType: 'USER', entityId: managedUser.id }, select: { action: true } });
    const values = actions.map(({ action }) => action);
    expect(values).toEqual(expect.arrayContaining(['USER_CREATED', 'USER_UPDATED', 'USER_ROLE_CHANGED', 'USER_DEACTIVATED', 'USER_ACTIVATED']));
  });

  it('USER-24 audit metadata contains no credentials', async () => {
    const audits = await prisma.auditLog.findMany({ where: { entityType: 'USER', entityId: managedUser.id } });
    const serialized = JSON.stringify(audits);
    expect(serialized).not.toContain(password);
    expect(serialized).not.toMatch(/passwordHash|accessToken|jwt/i);
  });

  it('USER-25 administrator cannot deactivate their own account', async () => {
    const response = await request(app)
      .patch(`/api/v1/users/${fixtures.admin.id}/status`)
      .set(authorized())
      .send({ isActive: false });
    expect(response.status).toBe(403);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: fixtures.admin.id } })).isActive).toBe(true);
  });

  it('USER-26 administrator cannot remove their own administrator role', async () => {
    const response = await request(app)
      .patch(`/api/v1/users/${fixtures.admin.id}`)
      .set(authorized())
      .send({ role: UserRole.RECRUITER });
    expect(response.status).toBe(403);
  });

  it('USER-27 malformed UUID returns validation error', async () => {
    const response = await request(app).get('/api/v1/users/not-a-uuid').set(authorized());
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
