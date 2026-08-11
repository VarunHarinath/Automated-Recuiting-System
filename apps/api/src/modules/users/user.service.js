import { Prisma, UserRole } from '@prisma/client';
import argon2 from 'argon2';
import { prisma } from '../../database/runtime-client.js';
import { ApiError } from '../../lib/api-error.js';
import { normalizeEmail } from '../auth/auth.validation.js';

export const safeUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
};

function auditData(actor, action, userId, description, metadata) {
  return {
    actorUserId: actor.id,
    action,
    entityType: 'USER',
    entityId: userId,
    description,
    metadata,
    ipAddress: actor.ipAddress,
    userAgent: actor.userAgent,
  };
}

function isUniqueEmailError(error) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

function emailConflict() {
  return new ApiError(409, 'EMAIL_ALREADY_EXISTS', 'A user with this email already exists.');
}

async function findUserOrThrow(id) {
  const user = await prisma.user.findUnique({ where: { id }, select: safeUserSelect });
  if (!user) throw new ApiError(404, 'USER_NOT_FOUND', 'The requested user was not found.');
  return user;
}

export async function listUsers({ page, limit, role, isActive, search }) {
  const where = {
    ...(role === undefined ? {} : { role }),
    ...(isActive === undefined ? {} : { isActive }),
    ...(search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };
  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: safeUserSelect,
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);
  return { users, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export function getUser(id) {
  return findUserOrThrow(id);
}

export async function createUser(input, actor) {
  const email = normalizeEmail(input.email);
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) throw emailConflict();
  const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });

  try {
    return await prisma.$transaction(async (transaction) => {
      const user = await transaction.user.create({
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          email,
          passwordHash,
          role: input.role,
          ...(input.isActive === undefined ? {} : { isActive: input.isActive }),
        },
        select: safeUserSelect,
      });
      await transaction.auditLog.create({
        data: auditData(actor, 'USER_CREATED', user.id, 'Internal user created.', {
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        }),
      });
      return user;
    });
  } catch (error) {
    if (isUniqueEmailError(error)) throw emailConflict();
    throw error;
  }
}

export async function updateUser(id, input, actor) {
  const existing = await findUserOrThrow(id);
  if (id === actor.id && input.role && input.role !== UserRole.ADMINISTRATOR) {
    throw new ApiError(403, 'FORBIDDEN', 'Administrators cannot remove their own administrator role.');
  }

  const data = { ...input };
  if (data.email !== undefined) {
    data.email = normalizeEmail(data.email);
    const duplicate = await prisma.user.findFirst({ where: { email: data.email, id: { not: id } }, select: { id: true } });
    if (duplicate) throw emailConflict();
  }

  const changedFields = Object.keys(data).filter((field) => data[field] !== existing[field]);
  if (changedFields.length === 0) return existing;

  try {
    return await prisma.$transaction(async (transaction) => {
      const updated = await transaction.user.update({ where: { id }, data, select: safeUserSelect });
      await transaction.auditLog.create({
        data: auditData(actor, 'USER_UPDATED', id, 'Internal user details updated.', {
          changedFields,
        }),
      });
      if (existing.role !== updated.role) {
        await transaction.auditLog.create({
          data: auditData(actor, 'USER_ROLE_CHANGED', id, 'Internal user role changed.', {
            previousRole: existing.role,
            newRole: updated.role,
          }),
        });
      }
      return updated;
    });
  } catch (error) {
    if (isUniqueEmailError(error)) throw emailConflict();
    throw error;
  }
}

export async function updateUserStatus(id, { isActive }, actor) {
  const existing = await findUserOrThrow(id);
  if (id === actor.id && !isActive) {
    throw new ApiError(403, 'FORBIDDEN', 'Administrators cannot deactivate their own account.');
  }
  if (existing.isActive === isActive) return existing;

  return prisma.$transaction(async (transaction) => {
    const updated = await transaction.user.update({ where: { id }, data: { isActive }, select: safeUserSelect });
    await transaction.auditLog.create({
      data: auditData(
        actor,
        isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
        id,
        isActive ? 'Internal user activated.' : 'Internal user deactivated.',
        { previousIsActive: existing.isActive, newIsActive: isActive },
      ),
    });
    return updated;
  });
}
