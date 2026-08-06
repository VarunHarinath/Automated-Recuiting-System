# Automated Recruitment Management System

Modular monorepo for the internal recruitment lifecycle described by the SRS in `docs/`.

## Prerequisites

- Node.js 22+ (JavaScript source; no TypeScript compilation)
- pnpm 10+
- Python 3.12+
- Docker with Docker Compose

## Foundation setup

1. Copy `.env.example` to `.env` and replace development secrets.
2. Run `pnpm install`.
3. Run `docker compose up -d postgres mailhog resume-processing`.
4. Run `pnpm dev` for the API and web application.

Local endpoints:

- Web: `http://localhost:5173`
- API health: `http://localhost:3000/api/v1/health`
- Resume service health: `http://localhost:8000/health`
- MailHog: `http://localhost:8025`

## Validation

```bash
pnpm lint
pnpm check
pnpm test
pnpm build
docker compose config
```

Phase 1 contains foundation and health checks only. Business modules begin in later approved phases.
