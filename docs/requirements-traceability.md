# Requirements Traceability Matrix

Status values: `Not Started`, `In Progress`, `Implemented`, `Verified`, `Deferred`, or `Blocked`. Phase 0 creates the baseline only; implementation columns are intentionally blank.

| Requirement ID | Description | Priority | Status | Backend files | Frontend files | Database models | Tests | Notes |
|---|---|---|---|---|---|---|---|---|
| USR-01 | Administrator user class | Must | Verified | `modules/users/*`, auth/RBAC middleware | — | User | USER-01, USER-04–27 | Administrator-only user management |
| USR-02 | Recruiter user class | Must | Verified | `modules/users/*`, auth/RBAC middleware | — | User | USER-02, USER-07, USER-13, USER-19, USER-22 | Managed internal role; no user-admin access |
| USR-03 | Interviewer user class | Must | Verified | `modules/users/*`, auth/RBAC middleware | — | User | USER-03, USER-07, USER-13 | Managed internal role; no user-admin access |
| USR-04 | Candidate actor/data subject | Could | Deferred | — | — | — | — | No candidate login in initial release |
| FR-AUTH-01 | User login | Must | Verified | `modules/auth/*`, `app.js` | — | User, AuditLog | AUTH-01, AUTH-18 | `POST /api/v1/auth/login` |
| FR-AUTH-02 | Generic invalid-login handling | Must | Verified | `auth.service.js`, `auth.controller.js` | — | User, AuditLog | AUTH-02–07 | Unknown, wrong-password, and inactive responses are identical |
| FR-AUTH-03 | Role-based access | Must | Verified | `middleware/authenticate.js`, `middleware/authorize.js` | — | User.role, User.isActive | AUTH-08–16 | Current DB role/active state is authoritative |
| FR-AUTH-04 | User logout | Must | Verified | `auth.routes.js`, `auth.controller.js`, `auth.service.js` | — | AuditLog | AUTH-19 | Stateless; client discards token |
| FR-AUTH-05 | Session expiry | Should | Verified | `auth.jwt.js`, `config/environment.js` | — | — | AUTH-12 | Configurable JWT expiration; no refresh token |
| FR-AUTH-06 | Internal user management | Should | Verified | `modules/users/*`, `app.js` | — | User, AuditLog | USER-01–27 | Administrator create/list/view/update/role/status; no deletion |
| FR-JOB-01 | Create job | Must | Implemented | `modules/jobs/*` | — | Job, Skill, JobSkill | JOB-01–13 | Manual execution pending |
| FR-JOB-02 | Edit job | Must | Implemented | `modules/jobs/*` | — | Job, JobSkill | JOB-21–22 | Manual execution pending |
| FR-JOB-03 | View job list/details | Must | Implemented | `modules/jobs/*` | — | Job | JOB-14, JOB-19–20 | Manual execution pending |
| FR-JOB-04 | Search/filter jobs | Must | Implemented | `modules/jobs/*` | — | Job | JOB-14–18 | Manual execution pending |
| FR-JOB-05 | Manage job status | Must | Implemented | `modules/jobs/*` | — | Job, AuditLog | JOB-23–25 | Manual execution pending |
| FR-JOB-06 | Reopen job | Should | Implemented | `modules/jobs/*` | — | Job | JOB-24 | Manual execution pending |
| FR-JOB-07 | Unique job identifier | Must | Implemented | `modules/jobs/*` | — | Job | JOB-10 | Database-generated code |
| FR-JOB-08 | Validate job | Must | Implemented | `job.validation.js` | — | Job constraints | JOB-05–09, JOB-13, JOB-22 | Manual execution pending |
| FR-CAN-01 | Create candidate manually or via resume | Must | Partially Implemented | `modules/candidates/*` | — | Candidate profile models | CAN-01–12 | Manual complete; resume upload not started |
| FR-CAN-02 | Upload and associate resume | Must | Not Started | — | — | — | — | Phase 4 |
| FR-CAN-03 | Store candidate details | Must | Implemented | `modules/candidates/*` | — | Candidate, skills, education, experience | CAN-08–11, CAN-18 | Manual execution pending |
| FR-CAN-04 | Edit candidate | Must | Implemented | `modules/candidates/*` | — | Candidate profile models | CAN-20–22 | Manual execution pending |
| FR-CAN-05 | Search/filter candidates | Must | Implemented | `modules/candidates/*` | — | Candidate, Skill | CAN-13–17 | Application-status search deferred |
| FR-CAN-06 | Candidate applications for multiple jobs | Must | Implemented | `modules/applications/*` | — | Application | APP-12 | Manual execution pending |
| FR-CAN-07 | Status per application | Must | Implemented | `modules/applications/*` | — | Application, status history | APP-09–10, APP-23–28 | Manual execution pending |
| FR-CAN-08 | Duplicate-email warning | Should | Implemented | `candidate.service.js` | — | Candidate.normalizedEmail | CAN-07 | Warning, not rejection |
| FR-CAN-09 | Secure original-resume download | Should | Not Started | — | — | — | — | OQ-011 |
| FR-CAN-10 | Internal application notes | Should | Implemented | `modules/applications/*` | — | ApplicationNote | APP-30 | Protected internal route |
| FR-SCR-01 | PDF/DOCX text extraction | Must | Implemented | `services/resume-processing/app` | Resume processing routes | `test_processing.py`, `resume.test.js` | Hybrid deterministic/Ollama extraction |
| FR-SCR-02 | Extract common candidate fields | Should | Implemented | FastAPI strict schemas and extractors | `Resume.parsedData` | PARSE tests | Candidate data is not overwritten |
| FR-SCR-03 | Match candidate to job | Must | Implemented | `screening.service.js` | Screening routes | SCR-05–SCR-14 | Exact normalized skills |
| FR-SCR-04 | Explainable screening score | Must | Implemented | Persisted configuration and criterion results | Screening detail | SCR-05–SCR-14 | See SCR-A02–05 |
| FR-SCR-05 | Rank applicants per job | Must | Implemented | Latest-result ranking service | `GET /jobs/:id/rankings` | SCR-26–29 | Descending total score |
| FR-SCR-06 | Matched/missing screening summary | Must | Implemented | Screening service | Screening detail/history | SCR-07–12 | Human-readable summary retained |
| FR-SCR-07 | Manual override/ignore | Must | Implemented | Override service/audit | `PATCH /screenings/:id/override` | SCR-21–25 | Score preserved |
| FR-SCR-08 | Re-screen after changes | Should | Implemented | Append-only results | `POST /applications/:id/rescreen` | SCR-16–18 | Prior results retained |
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
| BR-02 | Recruiter/admin job modification | Must | Implemented | `job.routes.js` | — | Job | JOB-01–04, JOB-21–24 | Central RBAC |
| BR-03 | Approved job statuses only | Must | Implemented | `job.validation.js` | — | JobStatus | JOB-23–24 | Enum validation |
| BR-04 | Application belongs to one candidate/job | Must | Implemented | `application.service.js` | — | Application | APP-04–08 | Transactional creation |
| BR-05 | Candidate may apply to multiple jobs | Must | Implemented | `application.service.js` | — | Application | APP-12 | Manual execution pending |
| BR-06 | Status belongs to application | Must | Implemented | `application.service.js` | — | Application | APP-09–10, APP-23–28 | No candidate status |
| BR-07 | Screening is advisory | Must | Not Started | — | — | — | — | Phase 5 |
| BR-08 | Human stage override | Must | Not Started | — | — | — | — | Phase 5 |
| BR-09 | Interviewer required before confirmation | Must | Not Started | — | — | — | — | Phase 6 |
| BR-10 | Feedback excluded from candidate emails | Must | Not Started | — | — | — | — | Phases 6/7 |
| BR-11 | Status actor/timestamp retained | Must | Implemented | `application.service.js` | — | ApplicationStatusHistory | APP-23–28 | Append-only history |
| BR-12 | No applications for closed jobs | Should | Implemented | `application.service.js` | — | Job, Application | APP-06–07 | Only OPEN accepted |
| IF-01 | Configured email provider | Must | Not Started | — | — | — | — | Phase 7 |
| IF-02 | Relational database | Must | Not Started | — | — | — | — | Phases 1/2 |
| IF-03 | Controlled file storage | Must | Not Started | — | — | — | — | Phase 4 |
| IF-04 | Optional calendar service | Could | Deferred | — | — | — | — | Out of initial scope |
| IF-05 | Optional approved LinkedIn API | Could | Deferred | — | — | — | — | No scraping |
| DATA-01 | User data | Must | Verified | `modules/users/user.service.js` | — | User | USER-05, USER-07–13, USER-15–17 | Safe fields only; passwordHash never returned |
| DATA-02 | Job data | Must | Implemented | `modules/jobs/*` | — | Job, Skill, JobSkill | JOB-01–25 | Manual execution pending |
| DATA-03 | Candidate data | Must | Partially Implemented | `modules/candidates/*` | — | Candidate profile models | CAN-01–24 | Resume upload/download not started |
| DATA-04 | Application data | Must | Implemented | `modules/applications/*` | — | Application, history, notes | APP-01–30 | Screening relation remains later scope |
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

## Job, Candidate, and Application backend traceability (2026-08-12)

| Requirements | Routes | Implementation | Validation | Tests written | Status |
|---|---|---|---|---|---|
| FR-JOB-01–08, BR-02–03, DATA-02 | `POST/GET /api/v1/jobs`, `GET/PATCH /jobs/:id`, `PATCH /jobs/:id/status` | `modules/jobs/*` | strict job, skill, filter, UUID, and status schemas | JOB-01–25 | Implemented; manual test run pending |
| FR-CAN-01, FR-CAN-03–05, FR-CAN-08, DATA-03 | `POST/GET /api/v1/candidates`, `GET/PATCH /candidates/:id` | `modules/candidates/*` | strict candidate/profile/filter schemas | CAN-01–24 | Implemented; manual test run pending |
| FR-CAN-06–07, FR-CAN-10, BR-04–06, BR-11–12, DATA-04 | `POST/GET /api/v1/applications`, `GET/PATCH /applications/:id`, status and notes routes | `modules/applications/*` | strict creation/update/status/note/filter schemas | APP-01–30 | Implemented; manual test run pending |
| FR-AUD-01, FR-AUD-03 | Job/application status and AuditLog transactions | module services | safe metadata only | JOB-25, APP-10, APP-23–29 | Implemented; manual test run pending |
| NFR-SEC-02, NFR-SEC-06–07 | All routes | existing authenticate/requireRole and ApiError | strict schemas; 100-row limit | negative RBAC/validation cases in each suite | Implemented; manual test run pending |

Note: FR-CAN-02 and FR-CAN-09 resume upload/download remain `Not Started`. FR-SCR-01–08 are now implemented using controlled existing Resume storage references; this phase does not add a public upload endpoint.

## User Management backend traceability (2026-08-10)

| Requirement | Routes | Implementation | Validation | Tests | Status |
|---|---|---|---|---|---|
| FR-AUTH-06 / USR-01–03 | `GET/POST /api/v1/users`, `GET/PATCH /api/v1/users/:id`, `PATCH /api/v1/users/:id/status` | `user.routes.js`, `user.controller.js`, `user.service.js` | `user.validation.js` | USER-01–27 | Verified |
| NFR-SEC-01 | `POST /api/v1/users` | Argon2id hash; safe Prisma select | 8–128 character temporary baseline (USR-A01) | USER-10–11, USER-24 | Verified |
| NFR-SEC-02 / NFR-SEC-07 | All `/api/v1/users` routes | Existing `authenticate` + `requireRole(ADMINISTRATOR)` | Current DB role/active state | USER-01–04, USER-22, USER-25–26 | Verified |
| NFR-SEC-06 | All user inputs | Controller parsing and service normalization | Strict body/query/UUID schemas; 100-row maximum | USER-06, USER-08–09, USER-14, USER-18–21, USER-27 | Verified |
| NFR-REL-02 | All user routes | Existing centralized `ApiError`/error handler | Stable validation/not-found/conflict errors | USER-04, USER-06, USER-08, USER-14, USER-27 | Verified |
| DATA-01 / FR-AUD-04 foundation | User CRUD-without-delete and AuditLog | Transactional user/audit writes | No secrets in audit metadata | USER-05, USER-07, USER-12–17, USER-23–24 | Verified |

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
# Resume Processing and Screening implementation (2026-08-12)

| Requirement | Implementation | Persistence | Tests | Status |
|---|---|---|---|---|
| FR-SCR-01, FR-SCR-02 | `services/resume-processing/app/extractors.py`, `ollama.py`, `main.py`; Node resume client/routes | `Resume.processingStatus`, `extractedText`, `parsedData`, `processingError` | `test_processing.py`, `resume.test.js` | Implemented |
| FR-SCR-03, FR-SCR-04 | `screening.service.js` deterministic weighted calculation and criteria | `ScreeningConfiguration`, `ScreeningResult`, `ScreeningCriterionResult` | `screening.test.js` SCR-05–SCR-14 | Implemented |
| FR-SCR-05 | Screening history and rescreen endpoints | Multiple immutable `ScreeningResult` rows | SCR-16–SCR-18 | Implemented |
| FR-SCR-06 | Latest-result job ranking endpoint | Latest result selected per application | SCR-26–SCR-29 | Implemented |
| FR-SCR-07 | Manual advisory override route | Override actor/reason/recommendation; score preserved | SCR-21–SCR-25 | Implemented |
| FR-SCR-08 | Human-readable summary and criterion details | Summary and JSON expected/actual/details | SCR-11–SCR-12 | Implemented |
| FR-AUD-01–04 | Minimal resume/screening audit events | `AuditLog` | PARSE-NODE-06, SCR-30–SCR-32 | Implemented for this module |
| NFR-SEC-02, NFR-SEC-06, NFR-SEC-07 | JWT/RBAC, strict request validation, storage-key containment | No schema change | RBAC/error tests in both suites | Implemented |
