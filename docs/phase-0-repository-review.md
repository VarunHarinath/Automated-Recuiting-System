# Phase 0 — Repository Review

## Sources reviewed

- `Automated_Recruitment_Management_System_SRS.docx` (version 1.0, August 2026; all 14 rendered pages and extracted tables reviewed)
- `Doc.md` (system design document, version 1.0)
- `System_Design.png` (C4-style container architecture diagram)

The prompt names `SRS.docx` and `system-design.md`, but those exact filenames are absent. The files above were treated as their apparent equivalents. This is recorded in `open-questions.md`.

## Current repository

The repository contains documentation only and is not currently a Git worktree. There is no application source, package manifest, database schema, migration, test suite, Docker configuration, or environment template.

```text
docs/
├── Automated_Recruitment_Management_System_SRS.docx
├── Doc.md
└── System_Design.png
```

## SRS summary

The system is an internal web application that centralizes recruitment from job creation through hiring, rejection, or withdrawal. Administrators manage internal users and organization-wide oversight; recruiters manage the recruitment workflow; interviewers access assigned interviews and submit internal feedback. Candidate login is not required for the initial release.

The Node/Express API is the system orchestrator and the only backend accessed by the React frontend. PostgreSQL stores normalized recruitment records. A Python/FastAPI service extracts structured information from PDF and DOCX resumes and supports transparent, rule-based screening. File and email providers sit behind abstractions. Screening is advisory: recruiters retain control, may override results, and the system must never make an irreversible hiring decision automatically.

Applications—not candidates—carry recruitment status. A candidate may have applications for multiple jobs, while each candidate/job pair is unique unless later approved otherwise. Important changes and communication attempts are auditable. The three-month scope prioritizes the complete internal workflow; candidate self-service and third-party integrations are deferred.

## Functional modules

1. Authentication and role-based access: login, generic invalid-login responses, logout, expiry, protected routes/endpoints, activation, deactivation, and role assignment.
2. Job management: create, edit, view, search/filter, status changes, reopening, identifiers, and validation.
3. Candidate and application management: manual/resume-based creation, profile correction, search, duplicate-email warning, secure resume download, notes, multi-job linkage, and per-application status.
4. Resume processing and screening: PDF/DOCX validation and extraction, structured fields, rule-based job matching, explainable scoring, ranking, override, and re-screening.
5. Interview management: scheduling, multiple interviewer assignments, rounds, timezone and mode details, rescheduling, cancellation, conflicts, history, and internal feedback.
6. Communication: reusable templates, preview/edit, interview/status/offer/rejection messages, delivery history, failure recording, and retry.
7. Dashboard and reporting: summary and pipeline metrics, filters, permission-aware reports, derived hiring metrics, and CSV export.
8. Audit and activity tracking: security, job, candidate, application, screening, interview, communication, and user-management events without secrets.

## Non-functional requirements

- Performance: normal pages and searches target three seconds under demo load; resume progress must be visible; dashboard requests must not block the interface.
- Security/privacy: password hashing, backend authorization, least privilege, HTTPS in production, upload restrictions, private candidate files, validation, secure headers/CORS/request limits, environment secrets, and safe logs/errors.
- Reliability/data integrity: normalized relationships, unique and check constraints, independent email/status transactions, useful error messages, and documented backup/restore.
- Usability/accessibility: consistent navigation and forms, clear validation, laptop/tablet responsiveness, readable states, accessible labels, and keyboard-friendly core workflows.
- Maintainability/scalability: modular monorepo, strong typing, centralized contracts/validation/error handling, configuration over hard-coding, service abstractions, documentation, and growth without major redesign.
- Compatibility/operations: modern Chrome, Edge, and Safari; Dockerized local services; configured email, storage, and database dependencies.

## Proposed repository structure

```text
automated-recruitment-system/
├── apps/
│   ├── api/src/{config,middleware,modules,services,lib}/
│   └── web/src/{app,components,features,pages,services}/
├── services/resume-processing/{app,tests}/
├── packages/
│   ├── config/
│   ├── shared-types/
│   └── validation/
├── prisma/{schema.prisma,migrations,seed.js}
├── storage/.gitkeep
├── tests/e2e/
├── docs/
├── docker-compose.yml
├── .env.example
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── README.md
```

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| One developer and 12 weeks | Incomplete core workflow | Build vertical slices, enforce Must-before-Should priority, reserve final hardening time. |
| SRS/design inconsistencies | Rework or wrong behavior | Track questions and assumptions; treat SRS as authoritative; require approval for scope changes. |
| Resume variability | Poor extraction accuracy | Deterministic extraction, confidence/empty handling, editable fields, representative fixtures. |
| Screening bias or opacity | Unsafe decisions and low trust | Explainable configurable rules, criterion details, human override, audit trail, no automatic final decisions. |
| Sensitive candidate data | Privacy/security incident | Least privilege, authenticated downloads, file validation, safe logs, secret management, authorization tests. |
| Scheduling/timezone errors | Missed or conflicting interviews | Store timezone and instants, validate intervals, warn on overlap, retain history. |
| Email failures | Incorrect workflow state | Persist status independently, record attempts, retry explicitly, use idempotency safeguards. |
| Scope creep | Missed acceptance criteria | Defer portal, calendar, LinkedIn, chatbot, semantic AI, multi-tenancy, and other optional integrations. |
| Late integration failures | Demo instability | Docker health checks, contract tests, seeded demo data, and E2E tests from early vertical slices. |
| Undefined demo dataset/load | Unverifiable performance | Obtain targets; document test data volume and measure repeatably. |
