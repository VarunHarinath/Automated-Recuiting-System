import { z } from 'zod';

const uuid = z.string().uuid();
const nonBlank = z.string().trim().min(1);
const optionalUrl = z.string().url().optional().nullable();
const nonNegative = z.coerce.number().min(0);
const rating = z.coerce.number().int().min(1).max(5);

export const userCreateSchema = z.object({
  firstName: nonBlank.max(100), lastName: nonBlank.max(100), email: z.string().trim().toLowerCase().email(),
  password: z.string().min(12).max(128), role: z.enum(['ADMINISTRATOR', 'RECRUITER', 'INTERVIEWER']), isActive: z.boolean().default(true),
});

export const jobCreateSchema = z.object({
  title: nonBlank.max(200), department: nonBlank.max(150), description: nonBlank, location: nonBlank.max(200),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY']),
  minimumExperienceYears: nonNegative, maximumExperienceYears: nonNegative.optional().nullable(),
  salaryMinimum: nonNegative.optional().nullable(), salaryMaximum: nonNegative.optional().nullable(),
  currency: z.string().trim().length(3).toUpperCase().optional().nullable(), closingDate: z.coerce.date().optional().nullable(),
  status: z.enum(['OPEN', 'ON_HOLD', 'CLOSED']).default('OPEN'), createdById: uuid,
}).superRefine((value, context) => {
  if (value.maximumExperienceYears != null && value.maximumExperienceYears < value.minimumExperienceYears) context.addIssue({ code: 'custom', path: ['maximumExperienceYears'], message: 'Maximum experience cannot be lower than minimum experience.' });
  if (value.salaryMinimum != null && value.salaryMaximum != null && value.salaryMaximum < value.salaryMinimum) context.addIssue({ code: 'custom', path: ['salaryMaximum'], message: 'Maximum salary cannot be lower than minimum salary.' });
});
export const jobUpdateSchema = jobCreateSchema.partial().omit({ createdById: true });

export const candidateCreateSchema = z.object({
  firstName: nonBlank.max(100), lastName: nonBlank.max(100), email: z.string().trim().email(), phone: z.string().trim().max(50).optional().nullable(),
  location: z.string().trim().max(200).optional().nullable(), professionalSummary: z.string().trim().optional().nullable(), totalExperienceYears: nonNegative.optional().nullable(),
  currentJobTitle: z.string().trim().max(200).optional().nullable(), currentCompany: z.string().trim().max(200).optional().nullable(), linkedinUrl: optionalUrl, portfolioUrl: optionalUrl,
}).transform((value) => ({ ...value, normalizedEmail: value.email.toLowerCase() }));
export const candidateUpdateSchema = candidateCreateSchema;

export const applicationCreateSchema = z.object({ candidateId: uuid, jobId: uuid, assignedRecruiterId: uuid.optional().nullable(), source: z.string().trim().max(100).optional().nullable() });
export const applicationStatusUpdateSchema = z.object({ newStatus: z.enum(['APPLIED', 'SCREENING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'OFFER_SENT', 'HIRED', 'REJECTED', 'WITHDRAWN']), reason: z.string().trim().max(2000).optional() });

export const interviewCreateSchema = z.object({
  applicationId: uuid, roundNumber: z.coerce.number().int().positive(), roundName: z.string().trim().max(100).optional().nullable(),
  mode: z.enum(['VIDEO', 'PHONE', 'IN_PERSON']), scheduledStart: z.coerce.date(), scheduledEnd: z.coerce.date(), timezone: nonBlank.max(100),
  location: z.string().trim().max(300).optional().nullable(), meetingLink: optionalUrl, createdById: uuid, interviewerIds: z.array(uuid).min(1),
}).superRefine((value, context) => {
  if (value.scheduledEnd <= value.scheduledStart) context.addIssue({ code: 'custom', path: ['scheduledEnd'], message: 'Interview end time must be after start time.' });
  if (value.mode === 'IN_PERSON' && !value.location) context.addIssue({ code: 'custom', path: ['location'], message: 'Location is required for in-person interviews.' });
  if (value.mode === 'VIDEO' && !value.meetingLink) context.addIssue({ code: 'custom', path: ['meetingLink'], message: 'Meeting link is required for video interviews.' });
});
export const interviewUpdateSchema = interviewCreateSchema.omit({ applicationId: true, createdById: true }).partial();

export const interviewFeedbackSchema = z.object({ interviewId: uuid, interviewerId: uuid, overallRating: rating, technicalRating: rating.optional().nullable(), communicationRating: rating.optional().nullable(), strengths: z.string().trim().optional().nullable(), concerns: z.string().trim().optional().nullable(), comments: z.string().trim().optional().nullable(), recommendation: z.enum(['STRONG_HIRE', 'HIRE', 'NEUTRAL', 'NO_HIRE', 'STRONG_NO_HIRE']) });

export const screeningConfigurationSchema = z.object({ name: nonBlank.max(150), skillsWeight: nonNegative, experienceWeight: nonNegative, educationWeight: nonNegative, preferredCriteriaWeight: nonNegative, isDefault: z.boolean(), createdById: uuid }).superRefine((value, context) => {
  const total = value.skillsWeight + value.experienceWeight + value.educationWeight + value.preferredCriteriaWeight;
  if (Math.abs(total - 100) > 0.001) context.addIssue({ code: 'custom', path: ['skillsWeight'], message: 'Screening weights must total 100.' });
});

export const emailTemplateSchema = z.object({ name: nonBlank.max(150), type: z.enum(['INTERVIEW_INVITATION', 'STATUS_UPDATE', 'OFFER_LETTER', 'REJECTION_LETTER', 'GENERAL']), subjectTemplate: nonBlank.max(500), bodyTemplate: nonBlank, isActive: z.boolean().default(true), createdById: uuid });
export const communicationCreateSchema = z.object({ applicationId: uuid, candidateId: uuid, templateId: uuid.optional().nullable(), type: z.enum(['INTERVIEW_INVITATION', 'STATUS_UPDATE', 'OFFER_LETTER', 'REJECTION_LETTER', 'GENERAL']), recipientEmail: z.string().trim().toLowerCase().email(), subject: nonBlank.max(500), renderedBody: nonBlank, sentById: uuid.optional().nullable() });
