import { PrismaClient, type ApplicationStatus, type UserRole } from '@prisma/client';
import argon2 from 'argon2';
import { ids, skills } from './seed-data.js';

const prisma = new PrismaClient();
const now = new Date();
const day = 86_400_000;

async function seedUsers(): Promise<void> {
  const users: Array<[string, string, string, string, UserRole, string]> = [
    [ids.admin, 'System', 'Administrator', 'admin@example.local', 'ADMINISTRATOR', process.env.SEED_ADMIN_PASSWORD ?? 'LocalAdmin!ChangeMe123'],
    [ids.recruiter, 'Riley', 'Recruiter', 'recruiter@example.local', 'RECRUITER', process.env.SEED_RECRUITER_PASSWORD ?? 'LocalRecruiter!ChangeMe123'],
    [ids.interviewer1, 'Jordan', 'Lee', 'interviewer1@example.local', 'INTERVIEWER', process.env.SEED_INTERVIEWER_PASSWORD ?? 'LocalInterviewer!ChangeMe123'],
    [ids.interviewer2, 'Morgan', 'Patel', 'interviewer2@example.local', 'INTERVIEWER', process.env.SEED_INTERVIEWER_PASSWORD ?? 'LocalInterviewer!ChangeMe123'],
  ];
  for (const [id, firstName, lastName, email, role, password] of users) {
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    await prisma.user.upsert({ where: { id }, update: { firstName, lastName, email, role, passwordHash, isActive: true }, create: { id, firstName, lastName, email, role, passwordHash } });
  }
}

async function seedReferenceData(): Promise<Record<string, string>> {
  const skillIds: Record<string, string> = {};
  for (const [index, name] of skills.entries()) {
    const id = `80000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`;
    const skill = await prisma.skill.upsert({ where: { normalizedName: name.toLowerCase() }, update: { name }, create: { id, name, normalizedName: name.toLowerCase() } });
    skillIds[name] = skill.id;
  }
  await prisma.screeningConfiguration.upsert({ where: { id: ids.config }, update: { name: 'Default transparent screening', isDefault: true }, create: { id: ids.config, name: 'Default transparent screening', skillsWeight: 50, experienceWeight: 25, educationWeight: 15, preferredCriteriaWeight: 10, isDefault: true, createdById: ids.admin } });
  const templates = [
    [ids.templateInterview, 'Interview invitation', 'INTERVIEW_INVITATION', 'Interview for {{jobTitle}}', 'Hello {{candidateName}}, your interview is scheduled for {{interviewDate}}.'],
    [ids.templateOffer, 'Standard offer', 'OFFER_LETTER', 'Offer for {{jobTitle}}', 'Hello {{candidateName}}, we are pleased to share an offer for {{jobTitle}}.'],
    [ids.templateReject, 'Standard rejection', 'REJECTION_LETTER', 'Update on {{jobTitle}}', 'Hello {{candidateName}}, thank you for your interest in {{jobTitle}}.'],
  ] as const;
  for (const [id, name, type, subjectTemplate, bodyTemplate] of templates) await prisma.emailTemplate.upsert({ where: { id }, update: { name, type, subjectTemplate, bodyTemplate }, create: { id, name, type, subjectTemplate, bodyTemplate, createdById: ids.admin } });
  return skillIds;
}

async function seedJobsAndCandidates(skillIds: Record<string, string>): Promise<void> {
  const jobs = [
    { id: ids.job1, jobCode: 'JOB-2026-000001', title: 'Full Stack Engineer', department: 'Engineering', description: 'Build secure recruitment workflow services and interfaces.', location: 'Chicago, IL', employmentType: 'FULL_TIME' as const, minimumExperienceYears: 3, maximumExperienceYears: 7, status: 'OPEN' as const },
    { id: ids.job2, jobCode: 'JOB-2026-000002', title: 'Data Engineer', department: 'Data', description: 'Design reliable PostgreSQL data pipelines and reporting models.', location: 'Remote', employmentType: 'FULL_TIME' as const, minimumExperienceYears: 2, maximumExperienceYears: 6, status: 'OPEN' as const },
    { id: ids.job3, jobCode: 'JOB-2026-000003', title: 'Frontend Intern', department: 'Engineering', description: 'Support accessible React user experiences.', location: 'Austin, TX', employmentType: 'INTERNSHIP' as const, minimumExperienceYears: 0, maximumExperienceYears: 1, status: 'ON_HOLD' as const },
  ];
  for (const job of jobs) await prisma.job.upsert({ where: { id: job.id }, update: job, create: { ...job, createdById: ids.recruiter, closingDate: new Date(now.getTime() + 45 * day) } });
  const jobSkills = [[ids.job1, 'JavaScript', 'REQUIRED'], [ids.job1, 'React', 'REQUIRED'], [ids.job1, 'Node.js', 'REQUIRED'], [ids.job1, 'PostgreSQL', 'PREFERRED'], [ids.job2, 'Python', 'REQUIRED'], [ids.job2, 'PostgreSQL', 'REQUIRED'], [ids.job3, 'JavaScript', 'REQUIRED'], [ids.job3, 'React', 'PREFERRED']] as const;
  for (const [jobId, skillName, requirementType] of jobSkills) await prisma.jobSkill.upsert({ where: { jobId_skillId_requirementType: { jobId, skillId: skillIds[skillName]!, requirementType } }, update: {}, create: { jobId, skillId: skillIds[skillName]!, requirementType } });

  const candidates = [
    [ids.candidate1, 'Avery', 'Johnson', 'avery.johnson@example.local', 5, 'Software Engineer', 'Northstar Labs'],
    [ids.candidate2, 'Sam', 'Rivera', 'sam.rivera@example.local', 3, 'Data Analyst', 'Lakeview Data'],
    [ids.candidate3, 'Taylor', 'Kim', 'taylor.kim@example.local', 1, 'Junior Developer', 'Independent'],
    [ids.candidate4, 'Casey', 'Brown', 'casey.brown@example.local', 7, 'Senior Engineer', 'Prairie Systems'],
    [ids.candidate5, 'Jamie', 'Wilson', 'jamie.wilson@example.local', 2, 'Frontend Developer', 'Bright Web'],
  ] as const;
  for (const [id, firstName, lastName, email, totalExperienceYears, currentJobTitle, currentCompany] of candidates) await prisma.candidate.upsert({ where: { id }, update: { firstName, lastName, email, normalizedEmail: email }, create: { id, firstName, lastName, email, normalizedEmail: email, totalExperienceYears, currentJobTitle, currentCompany, location: 'United States' } });
  for (const [index, candidate] of candidates.entries()) {
    await prisma.candidateEducation.upsert({ where: { id: `81000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}` }, update: {}, create: { id: `81000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`, candidateId: candidate[0], institution: 'Midwest State University', degree: index === 2 ? 'Associate Degree' : "Bachelor's Degree", fieldOfStudy: 'Computer Science', endDate: new Date('2024-05-15') } });
    await prisma.candidateExperience.upsert({ where: { id: `82000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}` }, update: {}, create: { id: `82000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`, candidateId: candidate[0], company: candidate[6], jobTitle: candidate[5], startDate: new Date('2022-01-01'), isCurrent: true, description: 'Delivered production software in a collaborative team.' } });
  }
  const candidateSkills = [[ids.candidate1, 'JavaScript', 5], [ids.candidate1, 'React', 4], [ids.candidate1, 'Node.js', 4], [ids.candidate2, 'Python', 3], [ids.candidate2, 'PostgreSQL', 2], [ids.candidate3, 'JavaScript', 1], [ids.candidate4, 'Node.js', 6], [ids.candidate4, 'PostgreSQL', 5], [ids.candidate5, 'React', 2]] as const;
  for (const [candidateId, skillName, yearsOfExperience] of candidateSkills) await prisma.candidateSkill.upsert({ where: { candidateId_skillId: { candidateId, skillId: skillIds[skillName]! } }, update: { yearsOfExperience }, create: { candidateId, skillId: skillIds[skillName]!, yearsOfExperience, source: 'MANUAL' } });
}

async function seedWorkflow(): Promise<void> {
  const apps: Array<[string, string, string, ApplicationStatus]> = [[ids.app1, ids.candidate1, ids.job1, 'INTERVIEW_COMPLETED'], [ids.app2, ids.candidate2, ids.job2, 'SCREENING'], [ids.app3, ids.candidate3, ids.job3, 'APPLIED'], [ids.app4, ids.candidate4, ids.job1, 'OFFER_SENT'], [ids.app5, ids.candidate5, ids.job3, 'REJECTED']];
  for (const [index, [id, candidateId, jobId, currentStatus]] of apps.entries()) await prisma.application.upsert({ where: { id }, update: { currentStatus }, create: { id, applicationCode: `APP-2026-${String(index + 1).padStart(6, '0')}`, candidateId, jobId, assignedRecruiterId: ids.recruiter, currentStatus, source: 'Development seed' } });
  await prisma.applicationStatusHistory.createMany({ skipDuplicates: true, data: apps.map(([applicationId, , , newStatus], index) => ({ id: `83000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`, applicationId, previousStatus: null, newStatus, changedById: ids.recruiter, reason: 'Development seed initial history' })) });
  await prisma.resume.upsert({ where: { id: ids.resume1 }, update: {}, create: { id: ids.resume1, candidateId: ids.candidate1, originalFileName: 'avery-johnson.pdf', storedFileName: 'seed-avery-johnson.pdf', storageKey: 'seed/resumes/avery-johnson.pdf', mimeType: 'application/pdf', fileSize: 102400n, checksum: 'seed-checksum-avery', processingStatus: 'COMPLETED', extractedText: 'Full stack engineer with JavaScript, React and Node.js experience.', parsedData: { skills: ['JavaScript', 'React', 'Node.js'] }, uploadedById: ids.recruiter, processedAt: now, isPrimary: true } });
  await prisma.resume.upsert({ where: { id: ids.resume2 }, update: {}, create: { id: ids.resume2, candidateId: ids.candidate2, originalFileName: 'sam-rivera.docx', storedFileName: 'seed-sam-rivera.docx', storageKey: 'seed/resumes/sam-rivera.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', fileSize: 89000n, checksum: 'seed-checksum-sam', processingStatus: 'COMPLETED', extractedText: 'Data professional with Python and PostgreSQL experience.', parsedData: { skills: ['Python', 'PostgreSQL'] }, uploadedById: ids.recruiter, processedAt: now, isPrimary: true } });
  for (const [id, score, screenedAt] of [[ids.screen1, 84, new Date(now.getTime() - day)], [ids.screen2, 88, now]] as const) await prisma.screeningResult.upsert({ where: { id }, update: {}, create: { id, applicationId: ids.app1, resumeId: ids.resume1, configurationId: ids.config, totalScore: score, skillsScore: 90, experienceScore: 80, educationScore: 75, preferredCriteriaScore: 70, matchedSkills: ['JavaScript', 'React', 'Node.js'], missingRequiredSkills: [], summary: 'Strong required-skill and experience match; recruiter review required.', recommendation: 'SHORTLIST', screenedAt } });
  await prisma.screeningCriterionResult.upsert({ where: { id: '84000000-0000-4000-8000-000000000001' }, update: {}, create: { id: '84000000-0000-4000-8000-000000000001', screeningResultId: ids.screen2, criterionType: 'REQUIRED_SKILLS', criterionName: 'Required skills match', expectedValue: ['JavaScript', 'React', 'Node.js'], actualValue: ['JavaScript', 'React', 'Node.js'], matched: true, score: 50, maximumScore: 50 } });
  const interviews = [{ id: ids.interview1, applicationId: ids.app1, roundNumber: 1, roundName: 'Technical', mode: 'VIDEO' as const, status: 'COMPLETED' as const, scheduledStart: new Date(now.getTime() - 3 * day), scheduledEnd: new Date(now.getTime() - 3 * day + 60 * 60_000), timezone: 'America/Chicago', meetingLink: 'https://meet.example.local/seed-technical', completedAt: new Date(now.getTime() - 3 * day) }, { id: ids.interview2, applicationId: ids.app4, roundNumber: 1, roundName: 'Hiring manager', mode: 'IN_PERSON' as const, status: 'SCHEDULED' as const, scheduledStart: new Date(now.getTime() + 2 * day), scheduledEnd: new Date(now.getTime() + 2 * day + 45 * 60_000), timezone: 'America/Chicago', location: 'Chicago Office' }];
  for (const interview of interviews) await prisma.interview.upsert({ where: { id: interview.id }, update: interview, create: { ...interview, createdById: ids.recruiter } });
  await prisma.interviewInterviewer.upsert({ where: { interviewId_interviewerId: { interviewId: ids.interview1, interviewerId: ids.interviewer1 } }, update: { isPrimary: true }, create: { interviewId: ids.interview1, interviewerId: ids.interviewer1, isPrimary: true } });
  await prisma.interviewInterviewer.upsert({ where: { interviewId_interviewerId: { interviewId: ids.interview2, interviewerId: ids.interviewer2 } }, update: { isPrimary: true }, create: { interviewId: ids.interview2, interviewerId: ids.interviewer2, isPrimary: true } });
  await prisma.interviewFeedback.upsert({ where: { interviewId_interviewerId: { interviewId: ids.interview1, interviewerId: ids.interviewer1 } }, update: {}, create: { interviewId: ids.interview1, interviewerId: ids.interviewer1, overallRating: 4, technicalRating: 4, communicationRating: 5, strengths: 'Clear technical reasoning and communication.', concerns: 'Limited exposure to high-scale systems.', comments: 'Proceed to recruiter review.', recommendation: 'HIRE' } });
  await prisma.interviewHistory.createMany({ skipDuplicates: true, data: interviews.map((interview, index) => ({ id: `85000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`, interviewId: interview.id, action: 'CREATED', newStart: interview.scheduledStart, newEnd: interview.scheduledEnd, newStatus: interview.status, changedById: ids.recruiter })) });
  await prisma.communication.upsert({ where: { id: '86000000-0000-4000-8000-000000000001' }, update: {}, create: { id: '86000000-0000-4000-8000-000000000001', applicationId: ids.app4, candidateId: ids.candidate4, templateId: ids.templateOffer, type: 'OFFER_LETTER', status: 'SENT', recipientEmail: 'casey.brown@example.local', subject: 'Offer for Full Stack Engineer', renderedBody: 'Hello Casey, we are pleased to share an offer.', sentById: ids.recruiter, sentAt: now } });
  await prisma.communication.upsert({ where: { id: '86000000-0000-4000-8000-000000000002' }, update: {}, create: { id: '86000000-0000-4000-8000-000000000002', applicationId: ids.app5, candidateId: ids.candidate5, templateId: ids.templateReject, type: 'REJECTION_LETTER', status: 'FAILED', recipientEmail: 'jamie.wilson@example.local', subject: 'Update on Frontend Intern', renderedBody: 'Hello Jamie, thank you for your interest.', failureReason: 'Development seed simulated delivery failure.', retryCount: 1, sentById: ids.recruiter } });
  await prisma.auditLog.createMany({ skipDuplicates: true, data: [{ id: '87000000-0000-4000-8000-000000000001', actorUserId: ids.admin, action: 'SEED_INITIALIZED', entityType: 'SYSTEM', entityId: 'development', description: 'Development seed initialized.' }, { id: '87000000-0000-4000-8000-000000000002', actorUserId: null, action: 'SYSTEM_DATABASE_READY', entityType: 'SYSTEM', entityId: 'database', description: 'System-generated database event.' }] });
}

async function main(): Promise<void> {
  await seedUsers();
  const skillIds = await seedReferenceData();
  await seedJobsAndCandidates(skillIds);
  await seedWorkflow();
  console.info('Development seed completed: 4 users, 3 jobs, 5 candidates, and 5 applications.');
}

main().catch((error: unknown) => { console.error('Development seed failed without exposing credentials.', error instanceof Error ? error.message : 'Unknown error'); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
