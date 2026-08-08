# Database Design

## 1. Overview

The database is a normalized PostgreSQL system of record for the internal recruitment lifecycle. Prisma is the application ORM and migration owner. The Node API remains the only application component permitted to access this database. Resume bytes remain in controlled file storage; PostgreSQL stores metadata and storage keys only.

## 2. Design goals

- Preserve recruitment and audit history.
- Keep candidates independent from their job-specific applications.
- Enforce identifiers, cardinality, ranges, and ordering at the database boundary where practical.
- Support explainable, repeatable screening and multiple interview rounds.
- Avoid hard deletion of operational history and avoid secrets in database logs or audit metadata.
- Provide indexes for known filtering, scheduling, ranking, reporting, and duplicate-detection paths.

## 3. Entities

| Entity | Purpose |
|---|---|
| User | Internal administrator, recruiter, or interviewer; contains Argon2 password hash only. |
| Job | Opening, employment/experience/salary requirements, state, and creator. |
| Skill / JobSkill | Canonical case-normalized skill catalog and required/preferred job criteria. |
| Candidate | Person-level profile; duplicate email is detectable but not prohibited. |
| CandidateSkill | Candidate-to-skill evidence, provenance, and optional experience. |
| CandidateEducation / CandidateExperience | Repeatable normalized education and employment history. |
| Resume | Controlled storage reference, extraction state, text, and structured parsing output. |
| Application | Unique candidate/job relationship carrying recruitment status. |
| ApplicationStatusHistory | Append-only stage transition record with actor, reason, and metadata. |
| ApplicationNote | Soft-deletable internal recruiter note attached to an application. |
| ScreeningConfiguration | Named, persisted scoring weights; one active default. |
| ScreeningResult | Versioned application/resume/configuration score and human override state. |
| ScreeningCriterionResult | Criterion-level expected/actual values and scoring explanation. |
| Interview | One application round with schedule, timezone, mode, and lifecycle state. |
| InterviewInterviewer | Many-to-many interview assignment; one optional primary interviewer. |
| InterviewFeedback | One internal 1–5 rating/recommendation per interviewer and interview. |
| InterviewHistory | Append-only creation, reschedule, cancellation, completion, and assignment history. |
| EmailTemplate | Reusable typed message template with render variables. |
| Communication | Durable rendered message and delivery attempt state, independent of application status. |
| AuditLog | Append-only security/business event with optional actor for system events. |

## 4. Relationships and cardinalities

- User 1:N Job, Resume upload, assigned Application, status history, notes, configurations, interviews, feedback, templates, communications, and audit events.
- Candidate 1:N Resume, Education, Experience, Application, Communication; Candidate N:M Skill through CandidateSkill.
- Job 1:N Application; Job N:M Skill through JobSkill.
- Candidate + Job has at most one Application. A candidate may have applications for many different jobs.
- Application 1:N status history, screening result, interview, communication, and note.
- ScreeningConfiguration and Resume each have 1:N ScreeningResult; a result has 1:N criterion rows.
- Interview N:M User through InterviewInterviewer and 1:N feedback/history. `(applicationId, roundNumber)` is unique.
- EmailTemplate 1:N Communication; template and sending user may become null while rendered history remains.

## 5. Enums

Required enums are `UserRole`, `JobStatus`, `EmploymentType`, `ApplicationStatus`, `InterviewMode`, `InterviewStatus`, `InterviewRecommendation`, `ResumeProcessingStatus`, `CommunicationType`, `CommunicationStatus`, and `SkillRequirementType`. `CandidateSkillSource` and `InterviewHistoryAction` are additional bounded SRS concepts.

## 6. Constraints

- UUID primary keys; unique normalized internal-user email, job/application code, skill normalized name, candidate/job application, job skill criterion, candidate skill, interview round, interview assignment, feedback author, and template name/type.
- Candidate normalized email is indexed but deliberately non-unique because FR-CAN-08 requires a warning rather than rejection.
- Check constraints enforce nonnegative experience, weights, salaries, file size and retries; valid maximum/minimum ranges; chronological education/employment/interview/job closing dates; 1–5 feedback ratings; 0–100 screening scores; criterion score bounds; mode-specific location/link; and complete override attribution.
- Screening weights total exactly 100. A partial unique index permits one default configuration.
- Partial unique indexes permit one primary resume per candidate and one primary interviewer per interview.
- `ApplicationStatusHistory`, `InterviewHistory`, and `AuditLog` reject UPDATE and DELETE through triggers.
- PostgreSQL sequences and functions generate `JOB-YYYY-NNNNNN` and `APP-YYYY-NNNNNN` safely under concurrency. Sequence values are intentionally not gap-free.

Some rules remain service-level: lowercase normalization before writes, user role suitability for assignments, approved status transition graph, closed-job application blocking, application/candidate consistency on Communication, single transaction for primary-record changes, and selected-status notification behavior.

## 7. Index strategy

- User `(role,isActive)` supports authorization/user administration; unique email supplies login lookup.
- Job status, department, location, closing date, and creator support list filters and ownership/audit queries.
- Candidate normalized email supports duplicate warnings; `(lastName,firstName)` supports common name ordering/search prefixes.
- Application job, candidate, recruiter, status, and applied date support pipeline/report filters. The unique candidate/job index also serves exact pair lookup.
- Resume candidate, processing state, and upload time support candidate views and workers.
- Screening `(applicationId,screenedAt)` supports latest result and history.
- Interview application, status, scheduled start, and creator support calendar/conflict and work-queue queries.
- Communication `(status,sentAt)` supports delivery queues/history; candidate/application indexes support profile views.
- Audit actor, action, `(entityType,entityId,createdAt)`, and created date support investigations and time filters.
- Foreign-key indexes on reusable joins prevent inefficient relation traversal. No speculative full-text or trigram index is included until measured search behavior is known.

## 8. Delete behavior

`Restrict` protects users, jobs, candidates, applications, resumes, screening, interviews, notes, and their history. Users are deactivated, jobs are closed, and candidates may be soft-deleted. Template and sending-user references on Communication use `SetNull`; rendered content remains. Audit actor and screening override actor use `SetNull` so history survives a permitted identity cleanup. Cascading deletion of recruitment history is intentionally absent.

## 9. Status and screening history

Application status is stored only on Application, never Candidate. Status changes update the current projection and append history in one transaction. Initial history permits null `previousStatus`. Screening results are never overwritten to represent a re-run: each run references the resume and configuration used, and criterion rows explain its components. An override records the actor and reason without automating the final hiring decision.

## 10. File storage and PII

Resume contains a private `storageKey`, controlled filenames, MIME type, size, checksum, processing state, and extracted data. It never stores raw bytes or public URLs. Authorization for download is enforced later in the API. Candidate fields and extracted text are personal data and must not be emitted in audit metadata or query logs. Prisma query logging is opt-in only in development.

## 11. Audit strategy

AuditLog supports user and system actors, general entity identifiers, sanitized JSON metadata, IP address, and user agent. Passwords, tokens, keys, raw resume contents, and provider credentials are forbidden. Append-only database triggers protect audit and workflow history.

## 12. Seed strategy

The TypeScript seed is repeatable through deterministic UUIDs, unique keys, upserts, and `createMany(skipDuplicates)` for append-only records. It creates four internal users with Argon2id hashes, six skills, three jobs, five candidates and profiles, five applications at varied stages, two resumes, two screening versions, two interviews, assignments, feedback, three templates, communication success/failure examples, and audit events. Passwords come from `SEED_*_PASSWORD`; local fallbacks are explicitly non-production.

## 13. Assumptions and decisions

- SRS cardinality wins over the older diagram: applications have many interview rounds and screening results.
- Feedback ratings use 1–5; technical and communication ratings are optional.
- Candidate email is required for the current schema but non-unique; normalized lowercase is application-validated.
- Interview times are UTC instants plus an IANA timezone for display.
- Database foundation TypeScript supersedes DEV-001 only for this explicitly requested phase; existing unrelated JavaScript remains unchanged.

## 14. Known limitations

- PostgreSQL does not enforce user-role suitability for recruiter/interviewer foreign keys.
- Database constraints cannot enforce that Communication.candidateId equals its Application candidate.
- Search uses standard B-tree indexes; full-text/trigram search awaits measured requirements.
- Code sequences can contain gaps after rollback, which is correct for concurrency safety.
- Retention periods and terminal-status reopening remain unresolved in `open-questions.md`.

## 15. Future extensions

Storage providers, calendar references, provider delivery events, refresh-token/session tables, richer screening configuration versions, consent/retention records, and approved integration identifiers can be added without changing the candidate/application boundary.
