import argon2 from 'argon2';
import { prisma } from '../../database/runtime-client.js';
import { ApiError } from '../../lib/api-error.js';
import { signAccessToken } from './auth.jwt.js';
import { normalizeEmail } from './auth.validation.js';

const publicUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  isActive: true,
};
const dummyPasswordHash = argon2.hash('non-user-password-for-uniform-verification', { type: argon2.argon2id });

async function writeAuditEvent(event) {
  try {
    await prisma.auditLog.create({ data: event });
  } catch {
    // Authentication must not expose audit persistence details to API clients.
  }
}

export async function login({ email, password }, requestContext = {}) {
  const normalizedEmail = normalizeEmail(email);
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  const hashToVerify = user?.passwordHash ?? (await dummyPasswordHash);
  const passwordMatches = await argon2.verify(hashToVerify, password);

  if (!user || !user.isActive || !passwordMatches) {
    await writeAuditEvent({
      action: 'AUTH_LOGIN_FAILED',
      entityType: 'AUTHENTICATION',
      entityId: 'anonymous',
      description: 'A login attempt was rejected.',
      ipAddress: requestContext.ipAddress,
      userAgent: requestContext.userAgent,
    });
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
    select: publicUserSelect,
  });
  await writeAuditEvent({
    actorUserId: user.id,
    action: 'AUTH_LOGIN_SUCCEEDED',
    entityType: 'USER',
    entityId: user.id,
    description: 'User authenticated successfully.',
    ipAddress: requestContext.ipAddress,
    userAgent: requestContext.userAgent,
  });

  return { accessToken: signAccessToken(updatedUser), user: sanitizeUser(updatedUser) };
}

export async function getActiveUser(userId) {
  return prisma.user.findFirst({
    where: { id: userId, isActive: true },
    select: publicUserSelect,
  });
}

export async function recordLogout(user, requestContext = {}) {
  await writeAuditEvent({
    actorUserId: user.id,
    action: 'AUTH_LOGOUT',
    entityType: 'USER',
    entityId: user.id,
    description: 'User requested stateless logout.',
    ipAddress: requestContext.ipAddress,
    userAgent: requestContext.userAgent,
  });
}

export function sanitizeUser(user) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };
}
