# Automated Recruitment Management System

Modular monorepo for the internal recruitment lifecycle described by the SRS in `docs/`.

## Implementation languages

- JavaScript/JSX: React frontend, Express HTTP foundation, API middleware/routes, and the original shared configuration/type-contract package entry points.
- TypeScript: Prisma client access, database health/shutdown/rule helpers, shared database-backed Zod schemas, Prisma seed data and seed runner, and database integration tests.
- Prisma Schema Language and SQL: normalized schema and versioned PostgreSQL migration.
- Python: FastAPI resume-processing service and pytest tests.

This split is intentional. DEV-001 established JavaScript for the Phase 1 application foundation; DEV-002 later authorized TypeScript specifically for the database foundation. See `docs/assumptions.md`.

## Prerequisites

- Node.js 22+ (JavaScript and TypeScript tooling)
- pnpm 11+
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
pnpm typecheck
pnpm test
pnpm build
docker compose config
```

<<<<<<< HEAD
=======
Database commands:

```bash
pnpm db:format
pnpm db:validate
pnpm db:generate
pnpm db:migrate -- --name <migration-name>
pnpm db:seed
TEST_DATABASE_URL=... pnpm db:test
```

Database design and constraints are documented in `docs/database-design.md`. Never run database tests against the normal development `DATABASE_URL`.

The repository currently contains the Phase 1 application foundation and the completed database foundation. Authentication APIs, frontend authentication, and later business modules are not yet implemented.
>>>>>>> 2cfd114 (Updated RBAC & Role based Auth)
