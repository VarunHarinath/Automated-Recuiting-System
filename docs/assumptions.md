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

- DEV-001 (2026-08-05): JavaScript is used for the Node.js API, React frontend, shared packages, scripts, and Prisma seed instead of the TypeScript originally required by the master prompt. This change was explicitly directed by the project owner after Phase 1 work began. Python remains the resume-processing language.
