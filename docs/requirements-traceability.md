# Requirements Traceability Matrix

Status values: `Not Started`, `In Progress`, `Implemented`, `Verified`, `Deferred`, or `Blocked`. Phase 0 creates the baseline only; implementation columns are intentionally blank.

| Requirement ID | Description | Priority | Status | Backend files | Frontend files | Database models | Tests | Notes |
|---|---|---|---|---|---|---|---|---|
| USR-01 | Administrator user class | Must | Not Started | — | — | — | — | Internal user |
| USR-02 | Recruiter user class | Must | Not Started | — | — | — | — | Internal user |
| USR-03 | Interviewer user class | Must | Not Started | — | — | — | — | Internal user |
| USR-04 | Candidate actor/data subject | Could | Deferred | — | — | — | — | No candidate login in initial release |
| FR-AUTH-01 | User login | Must | Verified | `modules/auth/*`, `app.js` | — | User, AuditLog | AUTH-01, AUTH-18 | `POST /api/v1/auth/login` |
| FR-AUTH-02 | Generic invalid-login handling | Must | Verified | `auth.service.js`, `auth.controller.js` | — | User, AuditLog | AUTH-02–07 | Unknown, wrong-password, and inactive responses are identical |
| FR-AUTH-03 | Role-based access | Must | Verified | `middleware/authenticate.js`, `middleware/authorize.js` | — | User.role, User.isActive | AUTH-08–16 | Current DB role/active state is authoritative |
| FR-AUTH-04 | User logout | Must | Verified | `auth.routes.js`, `auth.controller.js`, `auth.service.js` | — | AuditLog | AUTH-19 | Stateless; client discards token |
| FR-AUTH-05 | Session expiry | Should | Verified | `auth.jwt.js`, `config/environment.js` | — | — | AUTH-12 | Configurable JWT expiration; no refresh token |
| FR-AUTH-06 | Internal user management | Should | Not Started | — | — | — | — | Phase 2; OQ-007 |
| FR-JOB-01 | Create job | Must | Not Started | — | — | — | — | Phase 3 |
| FR-JOB-02 | Edit job | Must | Not Started | — | — | — | — | Phase 3 |
| FR-JOB-03 | View job list/details | Must | Not Started | — | — | — | — | Phase 3 |
| FR-JOB-04 | Search/filter jobs | Must | Not Started | — | — | — | — | Phase 3 |
| FR-JOB-05 | Manage job status | Must | Not Started | — | — | — | — | Phase 3 |
| FR-JOB-06 | Reopen job | Should | Not Started | — | — | — | — | Phase 3 |
| FR-JOB-07 | Unique job identifier | Must | Not Started | — | — | — | — | OQ-008 |
| FR-JOB-08 | Validate job | Must | Not Started | — | — | — | — | Phase 3 |
| FR-CAN-01 | Create candidate manually or via resume | Must | Not Started | — | — | — | — | Phase 4 |
| FR-CAN-02 | Upload and associate resume | Must | Not Started | — | — | — | — | Phase 4 |
| FR-CAN-03 | Store candidate details | Must | Not Started | — | — | — | — | Phase 4 |
| FR-CAN-04 | Edit candidate | Must | Not Started | — | — | — | — | Phase 4 |
| FR-CAN-05 | Search/filter candidates | Must | Not Started | — | — | — | — | Phase 4 |
| FR-CAN-06 | Candidate applications for multiple jobs | Must | Not Started | — | — | — | — | Phase 4 |
| FR-CAN-07 | Status per application | Must | Not Started | — | — | — | — | Phase 4 |
| FR-CAN-08 | Duplicate-email warning | Should | Not Started | — | — | — | — | OQ-009 |
| FR-CAN-09 | Secure original-resume download | Should | Not Started | — | — | — | — | OQ-011 |
| FR-CAN-10 | Internal application notes | Should | Not Started | — | — | — | — | Phase 4 |
| FR-SCR-01 | PDF/DOCX text extraction | Must | Not Started | — | — | — | — | Phase 5 |
| FR-SCR-02 | Extract common candidate fields | Should | Not Started | — | — | — | — | Phase 5 |
| FR-SCR-03 | Match candidate to job | Must | Not Started | — | — | — | — | Phase 5 |
| FR-SCR-04 | Explainable screening score | Must | Not Started | — | — | — | — | OQ-012 |
| FR-SCR-05 | Rank applicants per job | Must | Not Started | — | — | — | — | Phase 5 |
| FR-SCR-06 | Matched/missing screening summary | Must | Not Started | — | — | — | — | Phase 5 |
| FR-SCR-07 | Manual override/ignore | Must | Not Started | — | — | — | — | OQ-013 |
| FR-SCR-08 | Re-screen after changes | Should | Not Started | — | — | — | — | Phase 5 |
| FR-INT-01 | Schedule interview | Must | Not Started | — | — | — | — | Phase 6 |
| FR-INT-02 | Assign at least one interviewer | Must | Not Started | — | — | — | — | Phase 6 |
| FR-INT-03 | Store interview details | Must | Not Started | — | — | — | — | Phase 6 |
| FR-INT-04 | Reschedule interview | Must | Not Started | — | — | — | — | Phase 6 |
| FR-INT-05 | Cancel with reason | Must | Not Started | — | — | — | — | Phase 6 |
| FR-INT-06 | Interviewer conflict warning | Should | Not Started | — | — | — | — | OQ-014 |
| FR-INT-07 | Submit interview feedback | Must | Not Started | — | — | — | — | OQ-014 |
| FR-INT-08 | Interview rounds/history | Must | Not Started | — | — | — | — | OQ-002 |
| FR-COM-01 | Interview invitation | Must | Not Started | — | — | — | — | Phase 7 |
| FR-COM-02 | Selected status notifications | Should | Not Started | — | — | — | — | OQ-004 |
| FR-COM-03 | Offer-letter template | Must | Not Started | — | — | — | — | Phase 7 |
| FR-COM-04 | Rejection template | Must | Not Started | — | — | — | — | Phase 7 |
| FR-COM-05 | Maintain reusable templates | Should | Not Started | — | — | — | — | Phase 7 |
| FR-COM-06 | Communication history | Must | Not Started | — | — | — | — | Phase 7 |
| FR-COM-07 | Failure recording and retry | Should | Not Started | — | — | — | — | Phase 7 |
| FR-REP-01 | Dashboard summary | Must | Not Started | — | — | — | — | Phase 8 |
| FR-REP-02 | Applicants by job | Must | Not Started | — | — | — | — | Phase 8 |
| FR-REP-03 | Applications by stage | Must | Not Started | — | — | — | — | Phase 8 |
| FR-REP-04 | Dashboard/report filters | Should | Not Started | — | — | — | — | Phase 8 |
| FR-REP-05 | Hiring metrics | Should | Not Started | — | — | — | — | OQ-017 |
| FR-REP-06 | CSV export | Should | Not Started | — | — | — | — | Phase 8 |
| FR-REP-07 | Permission-aware report access | Must | Not Started | — | — | — | — | OQ-006 |
| FR-AUD-01 | Application status history | Must | Not Started | — | — | — | — | Phases 4/9 |
| FR-AUD-02 | Interview change history | Must | Not Started | — | — | — | — | Phases 6/9 |
| FR-AUD-03 | Job status history | Should | Not Started | — | — | — | — | Phases 3/9 |
| FR-AUD-04 | Administrator activity view | Should | Not Started | — | — | — | — | Phase 9 |
| NFR-PER-01 | Pages within three seconds under demo load | Should | Not Started | — | — | — | — | OQ-018 |
| NFR-PER-02 | Searches within three seconds | Should | Not Started | — | — | — | — | OQ-018 |
| NFR-PER-03 | Resume-processing progress | Should | Not Started | — | — | — | — | Phase 5 |
| NFR-PER-04 | Non-blocking dashboard loading | Should | Not Started | — | — | — | — | Phase 8 |
| NFR-SEC-01 | No plaintext passwords | Must | Verified | `auth.service.js` | — | User.passwordHash | AUTH-01–04, AUTH-17 | Argon2 verification; hashes never serialized |
| NFR-SEC-02 | Authorization on protected operations | Must | Verified | `authenticate.js`, `authorize.js` | — | User.role, User.isActive | AUTH-08–16 | Reusable authentication and role middleware |
| NFR-SEC-03 | HTTPS in production | Should | Not Started | — | — | — | — | Deployment |
| NFR-SEC-04 | Upload type/size validation | Must | Not Started | — | — | — | — | OQ-011 |
| NFR-SEC-05 | No public candidate PII URLs | Must | Not Started | — | — | — | — | Phases 4/9 |
| NFR-SEC-06 | Input validation | Must | Verified | `auth.validation.js`, `auth.controller.js` | — | — | AUTH-05–07 | Strict Zod request validation |
| NFR-SEC-07 | Least privilege | Must | Implemented | `authenticate.js`, `authorize.js` | — | User.role | AUTH-14–16 | Module-level RBAC complete; row-level policy remains OQ-006 |
| NFR-REL-01 | Relational data consistency | Must | Not Started | — | — | — | — | Phase 2 onward |
| NFR-REL-02 | Safe useful error handling | Must | Verified | `error-handler.js`, auth middleware/services | — | — | AUTH-02–12, AUTH-15–16 | Stable codes; no stacks/internal errors returned |
| NFR-REL-03 | Email failure independent of status | Must | Not Started | — | — | — | — | Phases 4/7 |
| NFR-REL-04 | Backup/restore documentation | Should | Not Started | — | — | — | — | Phase 10 |
| NFR-USA-01 | Consistent navigation | Must | Not Started | — | — | — | — | Frontend cross-cutting |
| NFR-USA-02 | Clear form validation | Must | Not Started | — | — | — | — | Frontend cross-cutting |
| NFR-USA-03 | Laptop/tablet responsive layout | Should | Not Started | — | — | — | — | Frontend cross-cutting |
| NFR-USA-04 | Readable interface | Should | Not Started | — | — | — | — | Frontend cross-cutting |
| NFR-USA-05 | Keyboard support | Could | Not Started | — | — | — | — | OQ-020 |
| NFR-MNT-01 | Modular design | Must | Not Started | — | — | — | — | Phase 1 onward |
| NFR-MNT-02 | Setup/config/API documentation | Must | Not Started | — | — | — | — | Cross-cutting |
| NFR-MNT-03 | Environment configuration | Must | Not Started | — | — | — | — | Phase 1 |
| NFR-MNT-04 | Optional integration extensibility | Should | Not Started | — | — | — | — | Architecture only initially |
| NFR-MNT-05 | Data growth without redesign | Should | Not Started | — | — | — | — | Database/index design |
| BR-01 | Authenticated internal record access | Must | Verified | `authenticate.js`, `auth.routes.js` | — | User | AUTH-08–13, AUTH-16 | `/me` and logout protected; middleware ready for later routes |
| BR-02 | Recruiter/admin job modification | Must | Not Started | — | — | — | — | Phase 3 |
| BR-03 | Approved job statuses only | Must | Not Started | — | — | — | — | Phase 3 |
| BR-04 | Application belongs to one candidate/job | Must | Not Started | — | — | — | — | Phase 2/4 |
| BR-05 | Candidate may apply to multiple jobs | Must | Not Started | — | — | — | — | Phase 4 |
| BR-06 | Status belongs to application | Must | Not Started | — | — | — | — | Phase 4 |
| BR-07 | Screening is advisory | Must | Not Started | — | — | — | — | Phase 5 |
| BR-08 | Human stage override | Must | Not Started | — | — | — | — | Phase 5 |
| BR-09 | Interviewer required before confirmation | Must | Not Started | — | — | — | — | Phase 6 |
| BR-10 | Feedback excluded from candidate emails | Must | Not Started | — | — | — | — | Phases 6/7 |
| BR-11 | Status actor/timestamp retained | Must | Not Started | — | — | — | — | Phase 4 |
| BR-12 | No applications for closed jobs | Should | Not Started | — | — | — | — | Phase 4 |
| IF-01 | Configured email provider | Must | Not Started | — | — | — | — | Phase 7 |
| IF-02 | Relational database | Must | Not Started | — | — | — | — | Phases 1/2 |
| IF-03 | Controlled file storage | Must | Not Started | — | — | — | — | Phase 4 |
| IF-04 | Optional calendar service | Could | Deferred | — | — | — | — | Out of initial scope |
| IF-05 | Optional approved LinkedIn API | Could | Deferred | — | — | — | — | No scraping |
| DATA-01 | User data | Must | Not Started | — | — | — | — | Phase 2 |
| DATA-02 | Job data | Must | Not Started | — | — | — | — | Phase 3 |
| DATA-03 | Candidate data | Must | Not Started | — | — | — | — | Phase 4 |
| DATA-04 | Application data | Must | Not Started | — | — | — | — | Phase 4 |
| DATA-05 | Interview data | Must | Not Started | — | — | — | — | Phase 6 |
| DATA-06 | Communication data | Must | Not Started | — | — | — | — | Phase 7 |
| DATA-07 | Audit data | Should | Not Started | — | — | — | — | Phase 9 |

## Acceptance-story coverage

| User story | Primary requirements | Status | Test reference |
|---|---|---|---|
| US-01 Create a job posting | FR-JOB-01, FR-JOB-07, FR-JOB-08 | Not Started | — |
| US-02 Upload a candidate resume | FR-CAN-01–04, FR-SCR-01–02, NFR-SEC-04 | Not Started | — |
| US-03 Link a candidate to a job | FR-CAN-06–07, BR-04–06 | Not Started | — |
| US-04 Screen applicants | FR-SCR-03–08, BR-07–08 | Not Started | — |
| US-05 Schedule an interview | FR-INT-01–06, FR-COM-01 | Not Started | — |
| US-06 Submit feedback | FR-INT-07–08, BR-10 | Not Started | — |
| US-07 Send offer/rejection | FR-COM-03–07, NFR-REL-03 | Not Started | — |
| US-08 View recruitment metrics | FR-REP-01–07 | Not Started | — |

## Database foundation traceability (2026-08-06)

Business modules remain `Not Started`; `Database Ready` means their normalized persistence, constraints, indexes, migration, and shared input validation are available for later services/controllers.

| Requirements | Database model / field or relationship | Constraint / index | Migration | Validation schema | Database test | Database status |
|---|---|---|---|---|---|---|
| FR-AUTH-06 | User role, active state, passwordHash | Unique email; role/active index | init_recruitment_schema | userCreateSchema | DB-01 | Database Ready |
| FR-JOB-01–03 | Job, JobSkill, Skill, createdBy | Required FKs; normalized skills | init_recruitment_schema | jobCreateSchema / jobUpdateSchema | DB-02, DB-09 | Database Ready |
| FR-JOB-04 | Job status/department/location/closingDate | Filter indexes | init_recruitment_schema | job schemas | — | Database Ready |
| FR-JOB-05–06 | Job.status, closedAt | JobStatus enum | init_recruitment_schema | job schemas | — | Database Ready |
| FR-JOB-07 | Job.jobCode | Unique, sequence-backed code function | init_recruitment_schema | generated by DB | DB-02 | Verified |
| FR-JOB-08 | Experience, salary, closingDate | Range/date CHECK constraints | init_recruitment_schema | job schemas | DB-09 | Verified |
| FR-CAN-01–04 | Candidate, Resume, education, experience, skills | Required relationships; storage reference only | init_recruitment_schema | candidateCreate/UpdateSchema | — | Database Ready |
| FR-CAN-05 | normalizedEmail, candidate name, CandidateSkill | Lookup/name/FK indexes | init_recruitment_schema | candidate schemas | — | Database Ready |
| FR-CAN-06–07 | Candidate 1:N Application; Application.currentStatus | Candidate/job unique pair; status enum | init_recruitment_schema | application schemas | DB-03, DB-04 | Verified |
| FR-CAN-08 | Candidate.normalizedEmail | Non-unique duplicate-detection index | init_recruitment_schema | candidate schemas | — | Database Ready |
| FR-CAN-09 | Resume.storageKey/file metadata | Unique private storage key; no bytes | init_recruitment_schema | later upload schema | — | Database Ready |
| FR-CAN-10 | ApplicationNote | Restrict FKs; soft deletion | init_recruitment_schema | later note schema | — | Database Ready |
| FR-SCR-01–02 | Resume extraction fields/status/parsedData | File-size/status constraints and indexes | init_recruitment_schema | later upload schema | — | Database Ready |
| FR-SCR-03–06 | ScreeningResult and criterion results | Score bounds; application/date index | init_recruitment_schema | screeningConfigurationSchema | DB-06 | Verified |
| FR-SCR-07 | Override actor/reason fields | Complete override CHECK | init_recruitment_schema | later screening schema | — | Database Ready |
| FR-SCR-08 | Application 1:N ScreeningResult | No single-result constraint; history index | init_recruitment_schema | screeningConfigurationSchema | DB-06 | Verified |
| FR-INT-01–03 | Interview, InterviewInterviewer | Positive round, schedule/mode checks, assignment uniqueness | init_recruitment_schema | interviewCreateSchema | DB-07, DB-10 | Verified |
| FR-INT-04–06 | Interview schedule/status/history | Schedule/status indexes; append-only history | init_recruitment_schema | interviewUpdateSchema | DB-10 | Database Ready |
| FR-INT-07 | InterviewFeedback | Unique interview/interviewer; 1–5 checks | init_recruitment_schema | interviewFeedbackSchema | DB-08 | Verified |
| FR-INT-08 | Interview 1:N per Application; history | Unique application/round; append-only trigger | init_recruitment_schema | interview schemas | DB-07, DB-08 | Verified |
| FR-COM-01–05 | EmailTemplate and Communication | Template type/name uniqueness | init_recruitment_schema | emailTemplate/communication schemas | — | Database Ready |
| FR-COM-06–07 | Communication status, failure, retry, rendered body | Delivery indexes; failure/retry checks | init_recruitment_schema | communicationCreateSchema | DB-11 | Verified |
| FR-REP-01–07 | Job/Candidate/Application/Interview aggregate sources | Status/date/department/recruiter indexes | init_recruitment_schema | existing entity schemas | — | Database Ready |
| FR-AUD-01 | ApplicationStatusHistory | Application/date index; append-only trigger | init_recruitment_schema | applicationStatusUpdateSchema | DB-05 | Verified |
| FR-AUD-02 | InterviewHistory | Interview/date index; append-only trigger | init_recruitment_schema | interview schemas | — | Database Ready |
| FR-AUD-03 | Job timestamps/status plus AuditLog | Status/creator indexes | init_recruitment_schema | job schemas | — | Database Ready |
| FR-AUD-04 | AuditLog | Actor/action/entity/date indexes; append-only trigger | init_recruitment_schema | service-level sanitized audit input later | DB-12 | Verified |
| NFR-SEC-01 | User.passwordHash only | No password field; Argon2id seed hashes | init_recruitment_schema | userCreateSchema | seed verification | Verified |
| NFR-SEC-02 | UserRole and ownership/assignment FKs | Restrict relationships | init_recruitment_schema | role enums | — | Database Ready |
| NFR-SEC-04–05 | Resume metadata/storageKey | Positive size; private reference, no public URL/bytes | init_recruitment_schema | candidate/upload foundation | — | Database Ready |
| NFR-SEC-06 | All database-backed input types | CHECK/unique/FK plus Zod | init_recruitment_schema | nine schema groups | DB-01–DB-12 | Verified |
| NFR-REL-01 | All 22 models | Restrict FKs, unique/check constraints | init_recruitment_schema | shared database schemas | DB-01–DB-12 | Verified |
| NFR-MNT-01–03 | Prisma schema/client/migration/seed/docs | Modular client, env-only URL, documented design | init_recruitment_schema | packages/validation | typecheck/lint | Verified |
