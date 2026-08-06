# Implementation Plan

## Delivery principles

- The SRS is authoritative. Unclear or conflicting behavior goes to `open-questions.md`.
- Complete Must requirements before Should and Could requirements.
- Deliver small vertical slices with backend, frontend, validation, authorization, tests, API docs, and traceability together.
- The React app communicates only with the Node API; the Node API orchestrates database, resume, email, and storage access.
- End each phase with executed validation and a phase report; do not advance without approval.

## Twelve-week plan

| Week | Phase and outcome | Exit evidence |
|---|---|---|
| 1 | Phase 0: repository review; Phase 1 foundation begins | Reviewed baseline, questions, plan, traceability, workspace/Docker/health conventions |
| 2 | Phase 1 complete; Phase 2 database design | Type/lint checks, container health, response/error contracts, approved database design |
| 3 | Phase 2 authentication and RBAC | Prisma migration/seed, login/logout, protected routes/endpoints, auth tests |
| 4 | Phase 3 job management | Job CRUD/search/filter/status UI and API, validation, tests, OpenAPI |
| 5 | Phase 4 candidate/application core | Candidate CRUD, application uniqueness/status history, notes, tests |
| 6 | Phase 4 uploads; Phase 5 parsing begins | Secure upload/download and storage abstraction; PDF/DOCX extraction fixtures |
| 7 | Phase 5 screening complete | Explainable configurable scoring, ranking, overrides/re-screening, Python/API/UI tests |
| 8 | Phase 6 interviews | Scheduling, assignments, conflict warning, history, feedback, tests |
| 9 | Phase 7 communication | Templates, preview/edit/send/retry/history, provider abstraction, failure tests |
| 10 | Phase 8 dashboard/reporting | Metrics, filters, charts, CSV export, permission and calculation tests |
| 11 | Phase 9 audit/security hardening | Audit coverage, authorization matrix, upload/error/log review, security tests |
| 12 | Phase 10 final validation/documentation | Critical Playwright workflow, deployment/user docs, backup guide, demo data, known limitations |

## Phase gates

### Phase 0 — Repository review

Documentation only: inventory, SRS summary, modules, NFRs, structure, plan, questions, risks, assumptions, and traceability skeleton.

### Phase 1 — Foundation

Create the modular JavaScript monorepo; configure linting, formatting, Docker Compose, PostgreSQL, environment documentation, health checks, and shared response/error conventions. JavaScript replaces the originally specified TypeScript stack by explicit user direction on 2026-08-05.

### Phase 2 — Database and authentication

Write `database-design.md` before schema/migrations. Implement Prisma models, constraints/indexes, seeds, JWT authentication, password hashing, RBAC, internal user lifecycle, and auth tests.

### Phases 3–8 — Business modules

Implement one module at a time in the prescribed order. Each includes data/API/UI, authorization, validation, empty/loading/error states, tests, OpenAPI updates, and traceability.

### Phase 9 — Audit, security, and hardening

Complete audit events, authorization review, secure file access, redaction-safe logging, input/request controls, dependency/configuration review, and negative-path tests.

### Phase 10 — Final testing and documentation

Execute critical E2E workflows, regression checks, deployment/backup validation, and complete API/security/testing/deployment/user documentation plus demo data and limitations.

## Definition of done for each implementation phase

- Approved requirements and assumptions are identified.
- Only planned files are changed; unrelated work is preserved.
- Relevant lint, type, schema, unit, integration, and UI tests are executed.
- API and implementation documentation are updated.
- `requirements-traceability.md` and `implementation-progress.md` are updated.
- Failures and known issues are reported accurately.
