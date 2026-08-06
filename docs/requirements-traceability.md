# Requirements Traceability Matrix

Status values: `Not Started`, `In Progress`, `Implemented`, `Verified`, `Deferred`, or `Blocked`. Phase 0 creates the baseline only; implementation columns are intentionally blank.

| Requirement ID | Description | Priority | Status | Backend files | Frontend files | Database models | Tests | Notes |
|---|---|---|---|---|---|---|---|---|
| USR-01 | Administrator user class | Must | Not Started | — | — | — | — | Internal user |
| USR-02 | Recruiter user class | Must | Not Started | — | — | — | — | Internal user |
| USR-03 | Interviewer user class | Must | Not Started | — | — | — | — | Internal user |
| USR-04 | Candidate actor/data subject | Could | Deferred | — | — | — | — | No candidate login in initial release |
| FR-AUTH-01 | User login | Must | Not Started | — | — | — | — | Phase 2 |
| FR-AUTH-02 | Generic invalid-login handling | Must | Not Started | — | — | — | — | Phase 2 |
| FR-AUTH-03 | Role-based access | Must | Not Started | — | — | — | — | Phase 2 |
| FR-AUTH-04 | User logout | Must | Not Started | — | — | — | — | Phase 2 |
| FR-AUTH-05 | Session expiry | Should | Not Started | — | — | — | — | OQ-005 |
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
| NFR-SEC-01 | No plaintext passwords | Must | Not Started | — | — | — | — | Phase 2 |
| NFR-SEC-02 | Authorization on protected operations | Must | Not Started | — | — | — | — | Phases 2/9 |
| NFR-SEC-03 | HTTPS in production | Should | Not Started | — | — | — | — | Deployment |
| NFR-SEC-04 | Upload type/size validation | Must | Not Started | — | — | — | — | OQ-011 |
| NFR-SEC-05 | No public candidate PII URLs | Must | Not Started | — | — | — | — | Phases 4/9 |
| NFR-SEC-06 | Input validation | Must | Not Started | — | — | — | — | Cross-cutting |
| NFR-SEC-07 | Least privilege | Must | Not Started | — | — | — | — | OQ-006 |
| NFR-REL-01 | Relational data consistency | Must | Not Started | — | — | — | — | Phase 2 onward |
| NFR-REL-02 | Safe useful error handling | Must | Not Started | — | — | — | — | Phase 1 onward |
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
| BR-01 | Authenticated internal record access | Must | Not Started | — | — | — | — | Phase 2 |
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

