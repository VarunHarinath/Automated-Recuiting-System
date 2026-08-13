import { prisma } from '../../database/runtime-client.js';
import { ApiError } from '../../lib/api-error.js';

const jobInclude = {
  createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
  skills: { include: { skill: { select: { id: true, name: true, normalizedName: true } } }, orderBy: { createdAt: 'asc' } },
};

function audit(actor, action, entityId, metadata) {
  return { actorUserId: actor.id, action, entityType: 'JOB', entityId, metadata, ipAddress: actor.ipAddress, userAgent: actor.userAgent };
}

function normalizeSkill(name) { return name.trim().toLowerCase(); }

async function replaceSkills(transaction, jobId, skills = []) {
  await transaction.jobSkill.deleteMany({ where: { jobId } });
  for (const input of skills) {
    const normalizedName = normalizeSkill(input.name);
    await transaction.skill.createMany({ data: [{ name: input.name.trim(), normalizedName }], skipDuplicates: true });
    const skill = await transaction.skill.findUniqueOrThrow({ where: { normalizedName } });
    await transaction.jobSkill.create({ data: { jobId, skillId: skill.id, requirementType: input.requirementType, minimumYears: input.minimumYears, weight: input.weight } });
  }
}

async function findJob(id) {
  const job = await prisma.job.findUnique({ where: { id }, include: jobInclude });
  if (!job) throw new ApiError(404, 'JOB_NOT_FOUND', 'The requested job was not found.');
  return job;
}

export async function createJob(input, actor) {
  const { skills = [], ...data } = input;
  return prisma.$transaction(async (tx) => {
    const job = await tx.job.create({ data: { ...data, createdById: actor.id, closedAt: data.status === 'CLOSED' ? new Date() : null } });
    await replaceSkills(tx, job.id, skills);
    await tx.auditLog.create({ data: audit(actor, 'JOB_CREATED', job.id, { status: job.status, skillCount: skills.length }) });
    return tx.job.findUniqueOrThrow({ where: { id: job.id }, include: jobInclude });
  });
}

export async function listJobs({ page, limit, status, department, location, employmentType, search }) {
  const where = {
    ...(status ? { status } : {}), ...(department ? { department: { equals: department, mode: 'insensitive' } } : {}),
    ...(location ? { location: { equals: location, mode: 'insensitive' } } : {}), ...(employmentType ? { employmentType } : {}),
    ...(search ? { OR: ['jobCode', 'title', 'department', 'description'].map((field) => ({ [field]: { contains: search, mode: 'insensitive' } })) } : {}),
  };
  const [jobs, total] = await prisma.$transaction([
    prisma.job.findMany({ where, include: jobInclude, orderBy: [{ createdAt: 'desc' }, { id: 'asc' }], skip: (page - 1) * limit, take: limit }),
    prisma.job.count({ where }),
  ]);
  return { jobs, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export function getJob(id) { return findJob(id); }

export async function updateJob(id, input, actor) {
  const existing = await findJob(id);
  const { skills, ...data } = input;
  const minimumExperience = data.minimumExperienceYears ?? Number(existing.minimumExperienceYears);
  const maximumExperience = data.maximumExperienceYears === undefined ? (existing.maximumExperienceYears == null ? null : Number(existing.maximumExperienceYears)) : data.maximumExperienceYears;
  const salaryMinimum = data.salaryMinimum === undefined ? (existing.salaryMinimum == null ? null : Number(existing.salaryMinimum)) : data.salaryMinimum;
  const salaryMaximum = data.salaryMaximum === undefined ? (existing.salaryMaximum == null ? null : Number(existing.salaryMaximum)) : data.salaryMaximum;
  if (maximumExperience != null && maximumExperience < minimumExperience) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Maximum experience cannot be lower than minimum experience.');
  }
  if (salaryMinimum != null && salaryMaximum != null && salaryMaximum < salaryMinimum) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Maximum salary cannot be lower than minimum salary.');
  }
  return prisma.$transaction(async (tx) => {
    const job = await tx.job.update({ where: { id }, data: { ...data, ...(data.status ? { closedAt: data.status === 'CLOSED' ? new Date() : null } : {}) } });
    if (skills !== undefined) await replaceSkills(tx, id, skills);
    await tx.auditLog.create({ data: audit(actor, 'JOB_UPDATED', id, { changedFields: Object.keys(input) }) });
    return tx.job.findUniqueOrThrow({ where: { id: job.id }, include: jobInclude });
  });
}

export async function updateJobStatus(id, status, actor) {
  const current = await findJob(id);
  if (current.status === status) return current;
  return prisma.$transaction(async (tx) => {
    const job = await tx.job.update({ where: { id }, data: { status, closedAt: status === 'CLOSED' ? new Date() : null } });
    await tx.auditLog.create({ data: audit(actor, 'JOB_STATUS_CHANGED', id, { previousStatus: current.status, newStatus: status }) });
    return tx.job.findUniqueOrThrow({ where: { id: job.id }, include: jobInclude });
  });
}
