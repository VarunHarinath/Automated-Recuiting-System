# Open Questions

No temporary implementation assumptions are active in Phase 0. Questions are prioritized by their likely effect on design or acceptance.

| ID | Area | Question | Why it matters | Needed by |
|---|---|---|---|---|
| OQ-001 | Source files | Should the existing SRS and design files be renamed to the prompt’s canonical `SRS.docx` and `system-design.md`, or should references use their current names? | Prevents duplicate or broken documentation references. | Before Phase 1 docs updates |
| OQ-002 | Design conflict | The design document/diagram depicts candidate use and says an application may have one interview, while the SRS says no candidate login initially and requires interview rounds/history. Confirm that the SRS wins: internal-only UI and multiple interviews per application. | Changes actors, routes, and cardinality. | Before database design |
| OQ-003 | Status transitions | Are transitions restricted to the “Typical Next Status” paths, or may authorized recruiters move to any approved status with a reason? Can terminal statuses be reopened? | Determines validation and audit rules. | Before Phase 2 schema/API |
| OQ-004 | Status/email coupling | Which status changes should trigger optional notifications, and must offer/rejection status changes occur before or after sending? | Prevents false workflow state on failed email. | Before Phases 4 and 7 |
| OQ-005 | Authentication | What are access-token lifetime, inactivity timeout, logout invalidation, refresh-token, password policy, and account lockout requirements? | Affects token storage/schema and security tests. | Before Phase 2 |
| OQ-006 | Permissions | May recruiters access all records or only records they created/own? Which reports and audit details may interviewers/recruiters view? | Defines row-level authorization. | Before Phase 2 |
| OQ-007 | User provisioning | Should administrators set initial passwords, or should the system use invitation/password-reset flows? | Affects credential handling and email scope. | Before Phase 2 |
| OQ-008 | Job data | Are employment types enumerated? Which job fields are required? What format should the human-readable unique job identifier use? | Affects schema and validation. | Before Phase 3 |
| OQ-009 | Candidate identity | Is candidate email required? Should duplicate detection be case-insensitive and organization-wide, and can one person have multiple emails? | Affects normalization and uniqueness behavior. | Before Phase 4 |
| OQ-010 | Duplicate applications | The prompt says prevent duplicate candidate/job applications unless later approved. Is an override required, and who may perform it? | Affects unique constraint design. | Before Phase 4 |
| OQ-011 | Files | What maximum resume size, MIME detection policy, retention period, malware-scanning expectation, and generated-letter format are required? | Defines secure upload/storage behavior. | Before Phase 4 |
| OQ-012 | Screening | Are 50/25/15/10 the approved default weights; where are weights configured; how are partial skills, experience, and education scored; what recommendation thresholds apply? | Needed for reproducible explainable scores. | Before Phase 5 |
| OQ-013 | Screening versions | Must each re-screen retain immutable input/weight/result snapshots, and what exactly constitutes an override? | Affects auditability and schema cardinality. | Before Phase 5 |
| OQ-014 | Interviews | What rating scale and recommendation enum are required? Is technical/communication rating optional per interview? What overlap/buffer defines a conflict? | Affects validation and conflict detection. | Before Phase 6 |
| OQ-015 | Timezones | What default timezone is used, and should timestamps be displayed in recruiter, interviewer, or interview timezone? | Avoids scheduling errors. | Before Phase 6 |
| OQ-016 | Email | Which development provider should be the default, which delivery statuses are required, and are attachments needed for offer/rejection letters? | Affects provider and communication model. | Before Phase 7 |
| OQ-017 | Metrics | Define time-to-hire start/end events, interview-to-offer denominator, offer acceptance representation, date filtering semantics, and timezone. | Prevents misleading reports. | Before Phase 8 |
| OQ-018 | Performance | What “expected dataset” and concurrent demo usage should validate the three-second targets? | Makes NFR performance measurable. | Before performance testing |
| OQ-019 | Audit/retention | What audit events are mandatory beyond the SRS, who may view them, and what retention/deletion rules apply to candidate files, communications, and audit records? | Affects privacy and storage lifecycle. | Before Phase 9 |
| OQ-020 | Browser/accessibility | Which minimum browser versions and accessibility standard/level, if any, are acceptance targets? | Defines UI test matrix. | Before Phase 3 UI |

## Database-phase disposition

- OQ-002 was resolved for the database: the SRS wins, so applications have multiple screening results and interview rounds.
- OQ-008 was partially resolved by this phase: required employment types are enumerated and readable codes use transaction-safe PostgreSQL sequences. Required-field policy beyond the provided model remains a Job-module decision.
- OQ-009 was partially resolved: candidate email is required and normalized for lookup but deliberately non-unique.
- OQ-012 was partially resolved: 50/25/15/10 is the persisted default configuration; detailed matching and recommendation thresholds remain open for screening implementation.
- OQ-013 was resolved structurally: each re-screen creates a new result tied to its resume/configuration; override actor and reason are retained.
- OQ-014 was partially resolved: ratings are 1–5 and technical/communication ratings are optional; conflict buffers remain open.

## Authentication-module disposition

- OQ-005 is partially resolved for the approved access-token scope: `JWT_EXPIRES_IN` defaults to 15 minutes, expiration is enforced by JWT verification, and logout is stateless/client-side token disposal. Refresh tokens, server-side revocation, inactivity timeout, password policy, and lockout remain unapproved and unimplemented.
- OQ-006 remains open for future record-level authorization. This module establishes centralized role checks for `ADMINISTRATOR`, `RECRUITER`, and `INTERVIEWER`, but does not invent ownership rules for modules that are not yet implemented.

## User Management module disposition

- OQ-005 remains open for the final organization password policy. USR-A01 temporarily validates administrator-created passwords at 8–128 characters without changing authentication behavior.
- OQ-007 is partially resolved for this backend module by the approved `POST /api/v1/users` contract: administrators set an initial password, which is immediately Argon2id-hashed. Invitation and password-reset flows remain out of scope.
- USR-A02 prevents self-deactivation and self-demotion. Whether the system must additionally preserve a minimum number of active administrators remains an open policy decision.
