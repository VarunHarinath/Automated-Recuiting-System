import { EmploymentType, JobStatus, SkillRequirementType } from '@prisma/client';
import { z } from 'zod';
import { parseInput } from '../users/user.validation.js';

const nonBlank = (max) => z.string().trim().min(1).max(max);
const nullableNumber = z.coerce.number().min(0).nullable().optional();
const nullableDate = z.coerce.date().nullable().optional();

const skillSchema = z.object({
  name: nonBlank(100),
  requirementType: z.nativeEnum(SkillRequirementType),
  minimumYears: nullableNumber,
  weight: nullableNumber,
}).strict();

function validateRanges(value, context) {
  if (value.maximumExperienceYears != null && value.maximumExperienceYears < value.minimumExperienceYears) {
    context.addIssue({ code: 'custom', path: ['maximumExperienceYears'], message: 'Maximum experience cannot be lower than minimum experience.' });
  }
  if (value.salaryMinimum != null && value.salaryMaximum != null && value.salaryMaximum < value.salaryMinimum) {
    context.addIssue({ code: 'custom', path: ['salaryMaximum'], message: 'Maximum salary cannot be lower than minimum salary.' });
  }
  if (value.skills) {
    const normalized = value.skills.map((skill) => skill.name.trim().toLowerCase());
    if (new Set(normalized).size !== normalized.length) context.addIssue({ code: 'custom', path: ['skills'], message: 'Duplicate normalized skills are not allowed.' });
  }
}

const jobFields = {
  title: nonBlank(200), department: nonBlank(150), description: nonBlank(10_000), location: nonBlank(200),
  employmentType: z.nativeEnum(EmploymentType), minimumExperienceYears: z.coerce.number().min(0),
  maximumExperienceYears: nullableNumber, salaryMinimum: nullableNumber, salaryMaximum: nullableNumber,
  currency: z.string().trim().length(3).toUpperCase().nullable().optional(), closingDate: nullableDate,
  status: z.nativeEnum(JobStatus).optional(), skills: z.array(skillSchema).max(100).optional(),
};

export const jobCreateSchema = z.object(jobFields).strict().superRefine(validateRanges);
export const jobUpdateSchema = z.object(Object.fromEntries(Object.entries(jobFields).map(([key, schema]) => [key, schema.optional()])))
  .strict().refine((value) => Object.keys(value).length > 0, { message: 'At least one field must be provided.' }).superRefine(validateRanges);
export const jobStatusSchema = z.object({ status: z.nativeEnum(JobStatus) }).strict();
export const jobIdSchema = z.object({ id: z.string().uuid() }).strict();
export const jobListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.nativeEnum(JobStatus).optional(), department: nonBlank(150).optional(), location: nonBlank(200).optional(),
  employmentType: z.nativeEnum(EmploymentType).optional(), search: nonBlank(100).optional(),
}).strict();

export { parseInput };
