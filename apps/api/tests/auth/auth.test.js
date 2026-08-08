import argon2 from 'argon2';
import { randomUUID } from 'node:crypto';
import express from 'express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { UserRole } from '@prisma/client';
import { app } from '../../src/app.js';
import { prisma } from '../../src/database/runtime-client.js';
import { errorHandler } from '../../src/middleware/error-handler.js';
import { authenticate } from '../../src/middleware/authenticate.js';
import { requireRole } from '../../src/middleware/authorize.js';
import { signAccessToken } from '../../src/modules/auth/auth.jwt.js';

const password = 'AuthTest!Password123';
const runId = randomUUID();
const emails = {
  recruiter: `auth-recruiter-${runId}@example.local`,
  admin: `auth-admin-${runId}@example.local`,
  inactive: `auth-inactive-${runId}@example.local`,
};
let users;

async function login(email = emails.recruiter, suppliedPassword = password) {
  return request(app).post('/api/v1/auth/login').send({ email, password: suppliedPassword });
}

beforeAll(async () => {
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  const recruiter = await prisma.user.create({ data: { firstName: 'Auth', lastName: 'Recruiter', email: emails.recruiter, passwordHash, role: UserRole.RECRUITER } });
  const admin = await prisma.user.create({ data: { firstName: 'Auth', lastName: 'Admin', email: emails.admin, passwordHash, role: UserRole.ADMINISTRATOR } });
  const inactive = await prisma.user.create({ data: { firstName: 'Auth', lastName: 'Inactive', email: emails.inactive, passwordHash, role: UserRole.INTERVIEWER, isActive: false } });
  users = { recruiter, admin, inactive };
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe.sequential('Authentication API', () => {
  it('AUTH-01 accepts valid credentials and returns a JWT', async () => {
    const response = await login(`  ${emails.recruiter.toUpperCase()}  `);
    expect(response.status).toBe(200);
    expect(response.body.data.accessToken).toEqual(expect.any(String));
    expect(response.body.data.user.role).toBe(UserRole.RECRUITER);
  });

  it('AUTH-02 returns the generic response for an unknown email', async () => {
    const response = await login('unknown@example.local');
    expect(response.status).toBe(401);
    expect(response.body.error).toMatchObject({ code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' });
  });

  it('AUTH-03 returns the same generic response for a wrong password', async () => {
    const response = await login(emails.recruiter, 'incorrect-password');
    expect(response.status).toBe(401);
    expect(response.body.error).toMatchObject({ code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' });
  });

  it('AUTH-04 returns the same generic response for an inactive user', async () => {
    const response = await login(emails.inactive);
    expect(response.status).toBe(401);
    expect(response.body.error).toMatchObject({ code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' });
  });

  it('AUTH-05 rejects a missing email', async () => {
    const response = await request(app).post('/api/v1/auth/login').send({ password });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('AUTH-06 rejects an invalid email format', async () => {
    const response = await login('not-an-email');
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('AUTH-07 rejects a missing password', async () => {
    const response = await request(app).post('/api/v1/auth/login').send({ email: emails.recruiter });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('AUTH-08 accepts a valid Bearer token', async () => {
    const authenticated = await login();
    const response = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${authenticated.body.data.accessToken}`);
    expect(response.status).toBe(200);
  });

  it('AUTH-09 rejects a missing Authorization header', async () => {
    const response = await request(app).get('/api/v1/auth/me');
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('AUTH-10 rejects a malformed Authorization header', async () => {
    const response = await request(app).get('/api/v1/auth/me').set('Authorization', 'Basic abc');
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('INVALID_TOKEN');
  });

  it('AUTH-11 rejects an invalid JWT', async () => {
    const response = await request(app).get('/api/v1/auth/me').set('Authorization', 'Bearer invalid.jwt.token');
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('INVALID_TOKEN');
  });

  it('AUTH-12 rejects an expired JWT', async () => {
    const token = signAccessToken(users.recruiter, { expiresIn: '-1s' });
    const response = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('TOKEN_EXPIRED');
  });

  it('AUTH-13 returns a sanitized current user', async () => {
    const authenticated = await login();
    const response = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${authenticated.body.data.accessToken}`);
    expect(response.body.data).toEqual({
      id: users.recruiter.id,
      firstName: 'Auth',
      lastName: 'Recruiter',
      email: emails.recruiter,
      role: UserRole.RECRUITER,
      isActive: true,
    });
    expect(response.text).not.toContain('passwordHash');
  });

  it('AUTH-14 RBAC allows a permitted role', async () => {
    const protectedApp = express();
    protectedApp.get('/admin', authenticate, requireRole(UserRole.ADMINISTRATOR), (_request, response) => response.sendStatus(204));
    protectedApp.use(errorHandler);
    const token = signAccessToken(users.admin);
    expect((await request(protectedApp).get('/admin').set('Authorization', `Bearer ${token}`)).status).toBe(204);
  });

  it('AUTH-15 RBAC rejects an incorrect role', async () => {
    const protectedApp = express();
    protectedApp.get('/admin', authenticate, requireRole(UserRole.ADMINISTRATOR), (_request, response) => response.sendStatus(204));
    protectedApp.use(errorHandler);
    const token = signAccessToken(users.recruiter);
    const response = await request(protectedApp).get('/admin').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });

  it('AUTH-16 distinguishes unauthenticated 401 from authenticated 403', async () => {
    const protectedApp = express();
    protectedApp.get('/admin', authenticate, requireRole(UserRole.ADMINISTRATOR), (_request, response) => response.sendStatus(204));
    protectedApp.use(errorHandler);
    const unauthenticated = await request(protectedApp).get('/admin');
    const authenticated = await request(protectedApp).get('/admin').set('Authorization', `Bearer ${signAccessToken(users.recruiter)}`);
    expect(unauthenticated.status).toBe(401);
    expect(authenticated.status).toBe(403);
  });

  it('AUTH-17 never returns a password hash from login', async () => {
    const response = await login();
    expect(response.text).not.toContain('passwordHash');
    expect(response.text).not.toContain(users.recruiter.passwordHash);
  });

  it('AUTH-18 updates lastLoginAt after successful login', async () => {
    const before = await prisma.user.findUnique({ where: { id: users.recruiter.id } });
    await new Promise((resolve) => setTimeout(resolve, 5));
    await login();
    const after = await prisma.user.findUnique({ where: { id: users.recruiter.id } });
    expect(after.lastLoginAt.getTime()).toBeGreaterThan(before.lastLoginAt.getTime());
  });

  it('AUTH-19 completes stateless logout for an authenticated user', async () => {
    const authenticated = await login();
    const response = await request(app).post('/api/v1/auth/logout').set('Authorization', `Bearer ${authenticated.body.data.accessToken}`);
    expect(response.status).toBe(200);
    expect(response.body.data.message).toContain('Discard the access token');
  });
});
