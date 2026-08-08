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
