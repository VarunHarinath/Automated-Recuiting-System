-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMINISTRATOR', 'RECRUITER', 'INTERVIEWER');

-- CreateEnum
CREATE TYPE "public"."JobStatus" AS ENUM ('OPEN', 'ON_HOLD', 'CLOSED');

-- CreateEnum
CREATE TYPE "public"."EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY');

-- CreateEnum
CREATE TYPE "public"."ApplicationStatus" AS ENUM ('APPLIED', 'SCREENING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'OFFER_SENT', 'HIRED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "public"."InterviewMode" AS ENUM ('VIDEO', 'PHONE', 'IN_PERSON');

-- CreateEnum
CREATE TYPE "public"."InterviewStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "public"."InterviewRecommendation" AS ENUM ('STRONG_HIRE', 'HIRE', 'NEUTRAL', 'NO_HIRE', 'STRONG_NO_HIRE');

-- CreateEnum
CREATE TYPE "public"."ResumeProcessingStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."CommunicationType" AS ENUM ('INTERVIEW_INVITATION', 'STATUS_UPDATE', 'OFFER_LETTER', 'REJECTION_LETTER', 'GENERAL');

-- CreateEnum
CREATE TYPE "public"."CommunicationStatus" AS ENUM ('DRAFT', 'QUEUED', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."SkillRequirementType" AS ENUM ('REQUIRED', 'PREFERRED');

-- CreateEnum
CREATE TYPE "public"."CandidateSkillSource" AS ENUM ('RESUME', 'MANUAL', 'SCREENING');

-- CreateEnum
CREATE TYPE "public"."InterviewHistoryAction" AS ENUM ('CREATED', 'RESCHEDULED', 'CANCELLED', 'COMPLETED', 'INTERVIEWER_CHANGED');

-- Transaction-safe readable codes. Sequences prevent count+1 races.
CREATE SEQUENCE "public"."job_code_seq" START 1;
CREATE SEQUENCE "public"."application_code_seq" START 1;

CREATE FUNCTION "public"."generate_job_code"() RETURNS text
LANGUAGE sql VOLATILE AS $$
  SELECT 'JOB-' || to_char(CURRENT_DATE, 'YYYY') || '-' || lpad(nextval('public.job_code_seq')::text, 6, '0')
$$;

CREATE FUNCTION "public"."generate_application_code"() RETURNS text
LANGUAGE sql VOLATILE AS $$
  SELECT 'APP-' || to_char(CURRENT_DATE, 'YYYY') || '-' || lpad(nextval('public.application_code_seq')::text, 6, '0')
$$;

-- CreateTable
CREATE TABLE "public"."User" (
    "id" UUID NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Job" (
    "id" UUID NOT NULL,
    "jobCode" TEXT NOT NULL DEFAULT generate_job_code(),
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "employmentType" "public"."EmploymentType" NOT NULL,
    "minimumExperienceYears" DECIMAL(4,1) NOT NULL,
    "maximumExperienceYears" DECIMAL(4,1),
    "salaryMinimum" DECIMAL(14,2),
    "salaryMaximum" DECIMAL(14,2),
    "currency" CHAR(3),
    "closingDate" DATE,
    "status" "public"."JobStatus" NOT NULL DEFAULT 'OPEN',
    "closedAt" TIMESTAMP(3),
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Skill" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."JobSkill" (
    "id" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "skillId" UUID NOT NULL,
    "requirementType" "public"."SkillRequirementType" NOT NULL,
    "minimumYears" DECIMAL(4,1),
    "weight" DECIMAL(6,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Candidate" (
    "id" UUID NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "normalizedEmail" TEXT NOT NULL,
    "phone" TEXT,
    "location" TEXT,
    "professionalSummary" TEXT,
    "totalExperienceYears" DECIMAL(4,1),
    "currentJobTitle" TEXT,
    "currentCompany" TEXT,
    "linkedinUrl" TEXT,
    "portfolioUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CandidateSkill" (
    "id" UUID NOT NULL,
    "candidateId" UUID NOT NULL,
    "skillId" UUID NOT NULL,
    "yearsOfExperience" DECIMAL(4,1),
    "proficiency" TEXT,
    "source" "public"."CandidateSkillSource" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CandidateEducation" (
    "id" UUID NOT NULL,
    "candidateId" UUID NOT NULL,
    "institution" TEXT NOT NULL,
    "degree" TEXT,
    "fieldOfStudy" TEXT,
    "startDate" DATE,
    "endDate" DATE,
    "isCurrentlyStudying" BOOLEAN NOT NULL DEFAULT false,
    "grade" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateEducation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CandidateExperience" (
    "id" UUID NOT NULL,
    "candidateId" UUID NOT NULL,
    "company" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "location" TEXT,
    "startDate" DATE,
    "endDate" DATE,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Resume" (
    "id" UUID NOT NULL,
    "candidateId" UUID NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "storedFileName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" BIGINT NOT NULL,
    "checksum" TEXT NOT NULL,
    "processingStatus" "public"."ResumeProcessingStatus" NOT NULL DEFAULT 'UPLOADED',
    "extractedText" TEXT,
    "parsedData" JSONB,
    "processingError" TEXT,
    "uploadedById" UUID NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Application" (
    "id" UUID NOT NULL,
    "applicationCode" TEXT NOT NULL DEFAULT generate_application_code(),
    "candidateId" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "assignedRecruiterId" UUID,
    "currentStatus" "public"."ApplicationStatus" NOT NULL DEFAULT 'APPLIED',
    "source" TEXT,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastStatusChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "withdrawnAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "hiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ApplicationStatusHistory" (
    "id" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "previousStatus" "public"."ApplicationStatus",
    "newStatus" "public"."ApplicationStatus" NOT NULL,
    "changedById" UUID NOT NULL,
    "reason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ApplicationNote" (
    "id" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ApplicationNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ScreeningConfiguration" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "skillsWeight" DECIMAL(5,2) NOT NULL DEFAULT 50,
    "experienceWeight" DECIMAL(5,2) NOT NULL DEFAULT 25,
    "educationWeight" DECIMAL(5,2) NOT NULL DEFAULT 15,
    "preferredCriteriaWeight" DECIMAL(5,2) NOT NULL DEFAULT 10,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScreeningConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ScreeningResult" (
    "id" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "resumeId" UUID NOT NULL,
    "configurationId" UUID NOT NULL,
    "totalScore" DECIMAL(5,2) NOT NULL,
    "skillsScore" DECIMAL(5,2) NOT NULL,
    "experienceScore" DECIMAL(5,2) NOT NULL,
    "educationScore" DECIMAL(5,2) NOT NULL,
    "preferredCriteriaScore" DECIMAL(5,2) NOT NULL,
    "matchedSkills" JSONB NOT NULL,
    "missingRequiredSkills" JSONB NOT NULL,
    "summary" TEXT NOT NULL,
    "recommendation" TEXT,
    "isOverridden" BOOLEAN NOT NULL DEFAULT false,
    "overrideReason" TEXT,
    "overriddenById" UUID,
    "screenedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScreeningResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ScreeningCriterionResult" (
    "id" UUID NOT NULL,
    "screeningResultId" UUID NOT NULL,
    "criterionType" TEXT NOT NULL,
    "criterionName" TEXT NOT NULL,
    "expectedValue" JSONB,
    "actualValue" JSONB,
    "matched" BOOLEAN NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,
    "maximumScore" DECIMAL(5,2) NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScreeningCriterionResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Interview" (
    "id" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "roundName" TEXT,
    "mode" "public"."InterviewMode" NOT NULL,
    "status" "public"."InterviewStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledStart" TIMESTAMP(3) NOT NULL,
    "scheduledEnd" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL,
    "location" TEXT,
    "meetingLink" TEXT,
    "cancellationReason" TEXT,
    "createdById" UUID NOT NULL,
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InterviewInterviewer" (
    "id" UUID NOT NULL,
    "interviewId" UUID NOT NULL,
    "interviewerId" UUID NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewInterviewer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InterviewFeedback" (
    "id" UUID NOT NULL,
    "interviewId" UUID NOT NULL,
    "interviewerId" UUID NOT NULL,
    "overallRating" INTEGER NOT NULL,
    "technicalRating" INTEGER,
    "communicationRating" INTEGER,
    "strengths" TEXT,
    "concerns" TEXT,
    "comments" TEXT,
    "recommendation" "public"."InterviewRecommendation" NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InterviewHistory" (
    "id" UUID NOT NULL,
    "interviewId" UUID NOT NULL,
    "action" "public"."InterviewHistoryAction" NOT NULL,
    "previousStart" TIMESTAMP(3),
    "newStart" TIMESTAMP(3),
    "previousEnd" TIMESTAMP(3),
    "newEnd" TIMESTAMP(3),
    "previousStatus" "public"."InterviewStatus",
    "newStatus" "public"."InterviewStatus",
    "changedById" UUID NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailTemplate" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."CommunicationType" NOT NULL,
    "subjectTemplate" TEXT NOT NULL,
    "bodyTemplate" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Communication" (
    "id" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "candidateId" UUID NOT NULL,
    "templateId" UUID,
    "type" "public"."CommunicationType" NOT NULL,
    "status" "public"."CommunicationStatus" NOT NULL DEFAULT 'DRAFT',
    "recipientEmail" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "renderedBody" TEXT NOT NULL,
    "providerMessageId" TEXT,
    "failureReason" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "sentById" UUID,
    "queuedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Communication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" UUID NOT NULL,
    "actorUserId" UUID,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_role_isActive_idx" ON "public"."User"("role", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Job_jobCode_key" ON "public"."Job"("jobCode");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "public"."Job"("status");

-- CreateIndex
CREATE INDEX "Job_department_idx" ON "public"."Job"("department");

-- CreateIndex
CREATE INDEX "Job_location_idx" ON "public"."Job"("location");

-- CreateIndex
CREATE INDEX "Job_closingDate_idx" ON "public"."Job"("closingDate");

-- CreateIndex
CREATE INDEX "Job_createdById_idx" ON "public"."Job"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_normalizedName_key" ON "public"."Skill"("normalizedName");

-- CreateIndex
CREATE INDEX "JobSkill_skillId_idx" ON "public"."JobSkill"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "JobSkill_jobId_skillId_requirementType_key" ON "public"."JobSkill"("jobId", "skillId", "requirementType");

-- CreateIndex
CREATE INDEX "Candidate_normalizedEmail_idx" ON "public"."Candidate"("normalizedEmail");

-- CreateIndex
CREATE INDEX "Candidate_lastName_firstName_idx" ON "public"."Candidate"("lastName", "firstName");

-- CreateIndex
CREATE INDEX "CandidateSkill_skillId_idx" ON "public"."CandidateSkill"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateSkill_candidateId_skillId_key" ON "public"."CandidateSkill"("candidateId", "skillId");

-- CreateIndex
CREATE INDEX "CandidateEducation_candidateId_idx" ON "public"."CandidateEducation"("candidateId");

-- CreateIndex
CREATE INDEX "CandidateExperience_candidateId_idx" ON "public"."CandidateExperience"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "Resume_storageKey_key" ON "public"."Resume"("storageKey");

-- CreateIndex
CREATE INDEX "Resume_candidateId_idx" ON "public"."Resume"("candidateId");

-- CreateIndex
CREATE INDEX "Resume_processingStatus_idx" ON "public"."Resume"("processingStatus");

-- CreateIndex
CREATE INDEX "Resume_uploadedAt_idx" ON "public"."Resume"("uploadedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Application_applicationCode_key" ON "public"."Application"("applicationCode");

-- CreateIndex
CREATE INDEX "Application_jobId_idx" ON "public"."Application"("jobId");

-- CreateIndex
CREATE INDEX "Application_candidateId_idx" ON "public"."Application"("candidateId");

-- CreateIndex
CREATE INDEX "Application_assignedRecruiterId_idx" ON "public"."Application"("assignedRecruiterId");

-- CreateIndex
CREATE INDEX "Application_currentStatus_idx" ON "public"."Application"("currentStatus");

-- CreateIndex
CREATE INDEX "Application_appliedAt_idx" ON "public"."Application"("appliedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Application_candidateId_jobId_key" ON "public"."Application"("candidateId", "jobId");

-- CreateIndex
CREATE INDEX "ApplicationStatusHistory_applicationId_createdAt_idx" ON "public"."ApplicationStatusHistory"("applicationId", "createdAt");

-- CreateIndex
CREATE INDEX "ApplicationNote_applicationId_createdAt_idx" ON "public"."ApplicationNote"("applicationId", "createdAt");

-- CreateIndex
CREATE INDEX "ApplicationNote_authorId_idx" ON "public"."ApplicationNote"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "ScreeningConfiguration_name_key" ON "public"."ScreeningConfiguration"("name");

-- CreateIndex
CREATE INDEX "ScreeningConfiguration_createdById_idx" ON "public"."ScreeningConfiguration"("createdById");

-- CreateIndex
CREATE INDEX "ScreeningResult_applicationId_screenedAt_idx" ON "public"."ScreeningResult"("applicationId", "screenedAt");

-- CreateIndex
CREATE INDEX "ScreeningResult_resumeId_idx" ON "public"."ScreeningResult"("resumeId");

-- CreateIndex
CREATE INDEX "ScreeningResult_configurationId_idx" ON "public"."ScreeningResult"("configurationId");

-- CreateIndex
CREATE INDEX "ScreeningCriterionResult_screeningResultId_idx" ON "public"."ScreeningCriterionResult"("screeningResultId");

-- CreateIndex
CREATE INDEX "Interview_applicationId_idx" ON "public"."Interview"("applicationId");

-- CreateIndex
CREATE INDEX "Interview_status_idx" ON "public"."Interview"("status");

-- CreateIndex
CREATE INDEX "Interview_scheduledStart_idx" ON "public"."Interview"("scheduledStart");

-- CreateIndex
CREATE INDEX "Interview_createdById_idx" ON "public"."Interview"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "Interview_applicationId_roundNumber_key" ON "public"."Interview"("applicationId", "roundNumber");

-- CreateIndex
CREATE INDEX "InterviewInterviewer_interviewerId_idx" ON "public"."InterviewInterviewer"("interviewerId");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewInterviewer_interviewId_interviewerId_key" ON "public"."InterviewInterviewer"("interviewId", "interviewerId");

-- CreateIndex
CREATE INDEX "InterviewFeedback_interviewerId_idx" ON "public"."InterviewFeedback"("interviewerId");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewFeedback_interviewId_interviewerId_key" ON "public"."InterviewFeedback"("interviewId", "interviewerId");

-- CreateIndex
CREATE INDEX "InterviewHistory_interviewId_createdAt_idx" ON "public"."InterviewHistory"("interviewId", "createdAt");

-- CreateIndex
CREATE INDEX "EmailTemplate_createdById_idx" ON "public"."EmailTemplate"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplate_type_name_key" ON "public"."EmailTemplate"("type", "name");

-- CreateIndex
CREATE INDEX "Communication_applicationId_idx" ON "public"."Communication"("applicationId");

-- CreateIndex
CREATE INDEX "Communication_candidateId_idx" ON "public"."Communication"("candidateId");

-- CreateIndex
CREATE INDEX "Communication_status_sentAt_idx" ON "public"."Communication"("status", "sentAt");

-- CreateIndex
CREATE INDEX "Communication_sentById_idx" ON "public"."Communication"("sentById");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_idx" ON "public"."AuditLog"("actorUserId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "public"."AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_createdAt_idx" ON "public"."AuditLog"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "public"."AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."Job" ADD CONSTRAINT "Job_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobSkill" ADD CONSTRAINT "JobSkill_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobSkill" ADD CONSTRAINT "JobSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "public"."Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CandidateSkill" ADD CONSTRAINT "CandidateSkill_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "public"."Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CandidateSkill" ADD CONSTRAINT "CandidateSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "public"."Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CandidateEducation" ADD CONSTRAINT "CandidateEducation_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "public"."Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CandidateExperience" ADD CONSTRAINT "CandidateExperience_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "public"."Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Resume" ADD CONSTRAINT "Resume_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "public"."Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Resume" ADD CONSTRAINT "Resume_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "public"."Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_assignedRecruiterId_fkey" FOREIGN KEY ("assignedRecruiterId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApplicationStatusHistory" ADD CONSTRAINT "ApplicationStatusHistory_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApplicationStatusHistory" ADD CONSTRAINT "ApplicationStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApplicationNote" ADD CONSTRAINT "ApplicationNote_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApplicationNote" ADD CONSTRAINT "ApplicationNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ScreeningConfiguration" ADD CONSTRAINT "ScreeningConfiguration_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ScreeningResult" ADD CONSTRAINT "ScreeningResult_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ScreeningResult" ADD CONSTRAINT "ScreeningResult_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "public"."Resume"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ScreeningResult" ADD CONSTRAINT "ScreeningResult_configurationId_fkey" FOREIGN KEY ("configurationId") REFERENCES "public"."ScreeningConfiguration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ScreeningResult" ADD CONSTRAINT "ScreeningResult_overriddenById_fkey" FOREIGN KEY ("overriddenById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ScreeningCriterionResult" ADD CONSTRAINT "ScreeningCriterionResult_screeningResultId_fkey" FOREIGN KEY ("screeningResultId") REFERENCES "public"."ScreeningResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Interview" ADD CONSTRAINT "Interview_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Interview" ADD CONSTRAINT "Interview_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InterviewInterviewer" ADD CONSTRAINT "InterviewInterviewer_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "public"."Interview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InterviewInterviewer" ADD CONSTRAINT "InterviewInterviewer_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InterviewFeedback" ADD CONSTRAINT "InterviewFeedback_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "public"."Interview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InterviewFeedback" ADD CONSTRAINT "InterviewFeedback_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InterviewHistory" ADD CONSTRAINT "InterviewHistory_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "public"."Interview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InterviewHistory" ADD CONSTRAINT "InterviewHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailTemplate" ADD CONSTRAINT "EmailTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Communication" ADD CONSTRAINT "Communication_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Communication" ADD CONSTRAINT "Communication_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "public"."Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Communication" ADD CONSTRAINT "Communication_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."EmailTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Communication" ADD CONSTRAINT "Communication_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Cross-field and domain constraints not expressible in Prisma schema syntax.
ALTER TABLE "public"."Job" ADD CONSTRAINT "Job_experience_range_check" CHECK (
  "minimumExperienceYears" >= 0 AND ("maximumExperienceYears" IS NULL OR "maximumExperienceYears" >= "minimumExperienceYears")
);
ALTER TABLE "public"."Job" ADD CONSTRAINT "Job_salary_range_check" CHECK (
  ("salaryMinimum" IS NULL OR "salaryMinimum" >= 0) AND
  ("salaryMaximum" IS NULL OR "salaryMaximum" >= 0) AND
  ("salaryMinimum" IS NULL OR "salaryMaximum" IS NULL OR "salaryMaximum" >= "salaryMinimum")
);
ALTER TABLE "public"."Job" ADD CONSTRAINT "Job_closing_date_check" CHECK ("closingDate" IS NULL OR "closingDate" >= "createdAt"::date);
ALTER TABLE "public"."JobSkill" ADD CONSTRAINT "JobSkill_nonnegative_check" CHECK (
  ("minimumYears" IS NULL OR "minimumYears" >= 0) AND ("weight" IS NULL OR "weight" >= 0)
);
ALTER TABLE "public"."Candidate" ADD CONSTRAINT "Candidate_experience_check" CHECK ("totalExperienceYears" IS NULL OR "totalExperienceYears" >= 0);
ALTER TABLE "public"."CandidateSkill" ADD CONSTRAINT "CandidateSkill_experience_check" CHECK ("yearsOfExperience" IS NULL OR "yearsOfExperience" >= 0);
ALTER TABLE "public"."CandidateEducation" ADD CONSTRAINT "CandidateEducation_dates_check" CHECK (
  ("startDate" IS NULL OR "endDate" IS NULL OR "endDate" >= "startDate") AND NOT ("isCurrentlyStudying" AND "endDate" IS NOT NULL)
);
ALTER TABLE "public"."CandidateExperience" ADD CONSTRAINT "CandidateExperience_dates_check" CHECK (
  ("startDate" IS NULL OR "endDate" IS NULL OR "endDate" >= "startDate") AND NOT ("isCurrent" AND "endDate" IS NOT NULL)
);
ALTER TABLE "public"."Resume" ADD CONSTRAINT "Resume_file_size_check" CHECK ("fileSize" > 0);
ALTER TABLE "public"."ScreeningConfiguration" ADD CONSTRAINT "ScreeningConfiguration_weights_check" CHECK (
  "skillsWeight" >= 0 AND "experienceWeight" >= 0 AND "educationWeight" >= 0 AND "preferredCriteriaWeight" >= 0 AND
  "skillsWeight" + "experienceWeight" + "educationWeight" + "preferredCriteriaWeight" = 100
);
ALTER TABLE "public"."ScreeningResult" ADD CONSTRAINT "ScreeningResult_scores_check" CHECK (
  "totalScore" BETWEEN 0 AND 100 AND "skillsScore" BETWEEN 0 AND 100 AND "experienceScore" BETWEEN 0 AND 100 AND
  "educationScore" BETWEEN 0 AND 100 AND "preferredCriteriaScore" BETWEEN 0 AND 100
);
ALTER TABLE "public"."ScreeningResult" ADD CONSTRAINT "ScreeningResult_override_check" CHECK (
  (NOT "isOverridden" AND "overriddenById" IS NULL AND "overrideReason" IS NULL) OR
  ("isOverridden" AND "overriddenById" IS NOT NULL AND length(btrim("overrideReason")) > 0)
);
ALTER TABLE "public"."ScreeningCriterionResult" ADD CONSTRAINT "ScreeningCriterionResult_score_check" CHECK (
  "score" >= 0 AND "maximumScore" >= 0 AND "score" <= "maximumScore"
);
ALTER TABLE "public"."Interview" ADD CONSTRAINT "Interview_schedule_check" CHECK ("roundNumber" > 0 AND "scheduledEnd" > "scheduledStart");
ALTER TABLE "public"."Interview" ADD CONSTRAINT "Interview_mode_details_check" CHECK (
  ("mode" <> 'IN_PERSON' OR length(btrim("location")) > 0) AND ("mode" <> 'VIDEO' OR length(btrim("meetingLink")) > 0)
);
ALTER TABLE "public"."InterviewFeedback" ADD CONSTRAINT "InterviewFeedback_ratings_check" CHECK (
  "overallRating" BETWEEN 1 AND 5 AND ("technicalRating" IS NULL OR "technicalRating" BETWEEN 1 AND 5) AND
  ("communicationRating" IS NULL OR "communicationRating" BETWEEN 1 AND 5)
);
ALTER TABLE "public"."Communication" ADD CONSTRAINT "Communication_retry_check" CHECK ("retryCount" >= 0);
ALTER TABLE "public"."Communication" ADD CONSTRAINT "Communication_failure_check" CHECK ("status" <> 'FAILED' OR length(btrim("failureReason")) > 0);

-- Partial uniqueness expresses single-current choices without losing history.
CREATE UNIQUE INDEX "ScreeningConfiguration_single_default_idx" ON "public"."ScreeningConfiguration" ("isDefault") WHERE "isDefault" = true;
CREATE UNIQUE INDEX "Resume_single_primary_per_candidate_idx" ON "public"."Resume" ("candidateId") WHERE "isPrimary" = true;
CREATE UNIQUE INDEX "InterviewInterviewer_single_primary_idx" ON "public"."InterviewInterviewer" ("interviewId") WHERE "isPrimary" = true;

-- History and audit records are append-only at the database boundary.
CREATE FUNCTION "public"."prevent_history_mutation"() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION '% is append-only', TG_TABLE_NAME USING ERRCODE = '55000';
END;
$$;

CREATE TRIGGER "ApplicationStatusHistory_append_only" BEFORE UPDATE OR DELETE ON "public"."ApplicationStatusHistory"
FOR EACH ROW EXECUTE FUNCTION "public"."prevent_history_mutation"();
CREATE TRIGGER "InterviewHistory_append_only" BEFORE UPDATE OR DELETE ON "public"."InterviewHistory"
FOR EACH ROW EXECUTE FUNCTION "public"."prevent_history_mutation"();
CREATE TRIGGER "AuditLog_append_only" BEFORE UPDATE OR DELETE ON "public"."AuditLog"
FOR EACH ROW EXECUTE FUNCTION "public"."prevent_history_mutation"();
