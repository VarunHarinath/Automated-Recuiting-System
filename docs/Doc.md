# Automated Recruitment Management System

# System Design Document

## Version

1.0

---

# 1. Overview

The Automated Recruitment Management System is a web-based platform designed to automate and streamline the complete recruitment lifecycle. The system enables recruiters to create and manage job postings, process candidate applications, screen resumes, schedule interviews, communicate with candidates, and monitor recruitment progress through dashboards and reports.

The architecture follows a modular layered design to ensure scalability, maintainability, and clear separation of responsibilities between different system components.

---

# 2. Architecture Overview

The system follows a three-layer architecture consisting of:

- Presentation Layer
- Application Layer
- Data Layer

Additional supporting services are separated into independent containers to improve modularity and allow future scalability.

The primary components include:

- React Web Application
- Node.js Backend API
- PostgreSQL Database
- Resume Processing Service
- Email Service
- File Storage
- External Integrations

---

# 3. User Roles

The system supports four primary actors.

## Administrator

Responsible for managing users, roles, and system configuration.

Main responsibilities:

- User Management
- Role Management
- System Monitoring
- Report Access

---

## Recruiter

Responsible for the recruitment workflow.

Main responsibilities:

- Create Jobs
- Review Applications
- Screen Candidates
- Schedule Interviews
- Send Offers
- Reject Candidates

---

## Interviewer

Responsible for evaluating assigned candidates.

Main responsibilities:

- View Interview Schedule
- Submit Feedback
- Rate Candidates

---

## Candidate

Responsible for applying for jobs.

Main responsibilities:

- Browse Jobs
- Upload Resume
- Track Application Status

---

# 4. Presentation Layer

## React Web Application

Technology

- React
- Tailwind CSS

Purpose

The React application serves as the primary user interface for all users.

Responsibilities

- User Authentication
- Dashboard
- Job Management
- Candidate Management
- Resume Upload
- Resume Screening Results
- Interview Management
- Communication
- Reports

Communication

REST APIs over HTTPS.

---

# 5. Application Layer

## Backend API

Technology

- Node.js
- Express.js

Purpose

Acts as the central component of the architecture by coordinating all business logic and communication between internal services.

Responsibilities

- Authentication
- JWT Authorization
- Role Based Access Control
- Job Management
- Candidate Management
- Application Management
- Interview Scheduling
- Dashboard APIs
- Reporting
- Email Automation
- Audit Logging
- Validation
- Business Rules

The Backend communicates with all supporting services and acts as the single entry point for the frontend.

---

# 6. Resume Processing Service

Technology

- Python
- FastAPI

Purpose

Processes uploaded resumes and converts them into structured candidate information.

Responsibilities

- Resume Parsing
- PDF Processing
- DOCX Processing
- Candidate Information Extraction
- Skill Extraction
- Experience Detection
- Education Detection
- Keyword Matching
- Resume Scoring
- Candidate Ranking
- Screening Summary

The service returns structured JSON to the Backend API.

---

# 7. Data Layer

## PostgreSQL Database

Technology

- PostgreSQL

Purpose

Stores all application data.

Primary entities

- Users
- Roles
- Jobs
- Candidates
- Applications
- Resumes
- Candidate Skills
- Screening Results
- Interviews
- Interview Feedback
- Communications
- Email Templates
- Audit Logs

Relationships

- One Job can have multiple Applications.
- One Candidate can submit multiple Applications.
- Each Application belongs to one Job.
- Each Application may have one Screening Result.
- Each Application may have multiple Communications.
- Each Application may have one Interview.

---

# 8. File Storage

Purpose

Stores uploaded files separately from the relational database.

Files stored include:

- Candidate Resumes
- Offer Letters
- Rejection Letters

The storage service returns secure file references instead of exposing physical file locations.

---

# 9. Email Service

Purpose

Handles all outgoing candidate communication.

Responsibilities

- Interview Invitations
- Offer Letters
- Rejection Letters
- Status Notifications

The Backend API communicates with the Email Service whenever candidate communication is required.

---

# 10. External Integrations

The first release focuses on core recruitment functionality.

The following integrations are planned for future releases:

- Google Calendar
- Microsoft Outlook Calendar
- LinkedIn
- AI Resume Screening Engine
- Candidate Chatbot

These integrations remain independent of the core system and communicate through defined APIs.

---

# 11. Communication Flow

The following communication protocols are used throughout the system.

| Source | Destination | Protocol |
|---------|------------|----------|
| Frontend | Backend API | REST / HTTPS |
| Backend API | PostgreSQL | SQL |
| Backend API | Resume Service | REST |
| Backend API | Email Service | SMTP / Email API |
| Backend API | File Storage | Object Storage API |

---

# 12. Security

The system implements multiple security mechanisms.

- JWT Authentication
- Role Based Access Control (RBAC)
- HTTPS Communication
- Input Validation
- Secure File Upload Validation
- Password Encryption
- Audit Logging

---

# 13. Scalability

The architecture separates independent services so they can scale individually.

Future improvements include:

- Docker Containerization
- Kubernetes Deployment
- Redis Caching
- RabbitMQ Message Queue
- Load Balancer
- CDN
- Cloud Object Storage
- AI Screening Service

---

# 14. Architecture Summary

The architecture follows a modular container-based design where the Backend API acts as the central orchestrator for all recruitment operations.

The React frontend provides a user-friendly interface, while PostgreSQL manages persistent data. Independent services handle resume processing, email communication, and file storage, making the application easier to maintain and extend.

The design also keeps future integrations isolated, allowing additional features such as AI-powered screening and calendar synchronization to be incorporated without significant architectural changes.

---

# Design Principles

- Separation of Concerns
- Modular Architecture
- Scalability
- Maintainability
- Security by Design
- RESTful Communication
- Service Independence
- Future Extensibility