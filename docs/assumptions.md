# Assumptions

## SRS baseline assumptions

These are explicitly stated by the SRS and are not new implementation decisions:

- Internal users have reliable internet access.
- Candidates normally provide PDF or DOCX resumes.
- A working email account or mail service will be available for testing.
- Recruiters review all system-generated screening results.
- Sample recruitment data may be used for testing and demonstration.
- Optional integrations depend on approved API access and must not delay core modules.

## Temporary implementation assumptions

None adopted in Phase 0. Any future assumption needed to unblock implementation must include an ID, rationale, affected requirements/files, review owner, and expiry/decision point.

## Approved technical deviations

- DEV-001 (2026-08-05): The Phase 1 application foundation was changed from the originally requested TypeScript to JavaScript/JSX by explicit project-owner direction. This applies to the Express HTTP shell, React frontend, middleware/routes, and original shared-package entry points. Python remains the resume-processing language. Prisma/database code did not yet exist when this decision was made.
- DEV-002 (2026-08-06): A later explicit database-foundation instruction required TypeScript. Prisma access helpers, database rules/health/shutdown code, database-backed Zod schemas, seed data/runner, and database integration tests therefore use TypeScript. DEV-002 is a narrow extension of the language mix and supersedes DEV-001 only for database-layer files; it does not convert or invalidate the JavaScript Phase 1 foundation.

## Database implementation assumptions

- DB-A01: Candidate email is required but `normalizedEmail` is not unique; duplicate detection produces an application warning per FR-CAN-08.
- DB-A02: Applications have multiple screening results and interviews so re-screening and interview-round history are preserved; the SRS overrides the older single-result/single-interview diagram.
- DB-A03: Interview ratings use 1–5. Technical and communication ratings are optional.
- DB-A04: IANA timezone names accompany UTC timestamps; conflict buffers remain an open service-layer decision.
- DB-A05: Historical recruitment records use restrictive deletion. Candidate and application-note soft deletion is available where the SRS justifies business recovery/privacy workflows.

## User Management implementation assumptions

- USR-A01 (2026-08-10): The SRS does not define a password policy. Administrator-created passwords therefore require 8–128 characters as a temporary validation baseline. This expires when an approved organization password or invitation/reset policy is provided (OQ-005/OQ-007).
- USR-A02 (2026-08-10): An authenticated administrator cannot deactivate their own account or remove their own `ADMINISTRATOR` role. This prevents an accidental self-lockout while still allowing one administrator to manage other administrators. Review when a formal last-administrator policy is approved.

## Job, Candidate, and Application implementation assumptions

- JOB-A01 (2026-08-12): `closingDate` remains optional as permitted by the approved schema. When supplied, database constraints prevent it from preceding job creation; the API does not invent a separate timezone or same-day cutoff policy.
- CAN-A01 (2026-08-12): Duplicate normalized candidate email is allowed and returned as `meta.warnings[DUPLICATE_CANDIDATE_EMAIL]`, matching FR-CAN-08 and the approved non-unique database design.
- APP-A01 (2026-08-12): New applications are accepted only when `Job.status = OPEN`; both `CLOSED` and `ON_HOLD` return `JOB_NOT_OPEN`. This is the conservative interpretation of a job not currently accepting applications.
- APP-A02 (2026-08-12): Because the SRS lists a typical workflow but does not define a mandatory transition graph, authorized administrators/recruiters may move to any approved `ApplicationStatus`. Every actual change is transactional and append-only in status history.
- APP-A03 (2026-08-12): An assigned recruiter may be an active `RECRUITER` or `ADMINISTRATOR`; an `INTERVIEWER` cannot own an application.

## Resume processing and screening assumptions

- SCR-A01 (2026-08-12): Ollama enriches structured resume facts only. If it is unavailable, times out, or returns schema-invalid JSON, processing fails with a controlled status; deterministic extraction is not silently represented as a fully completed hybrid result.
- SCR-A02 (2026-08-12): Exact case-insensitive normalized skill matching is used. Semantic similarity and inferred equivalence are deliberately excluded.
- SCR-A03 (2026-08-12): Because `Job` has no education requirement, education is recorded as not applicable and excluded from the applicable-weight denominator. This prevents missing schema capability from penalizing candidates.
- SCR-A04 (2026-08-12): Criteria with no configured job requirement are excluded from the applicable-weight denominator. Total score is normalized to 0–100 across applicable criteria.
- SCR-A05 (2026-08-12): Advisory labels are `HIGH_MATCH` (80+), `MODERATE_MATCH` (60–79.99), and `LOW_MATCH` (below 60). They never change application status or make a hiring decision.
- SCR-A06 (2026-08-12): The existing `ScreeningResult.updatedAt` and append-only `SCREENING_OVERRIDE` audit record timestamp together record override timing; no schema migration is introduced solely for `overriddenAt`.
