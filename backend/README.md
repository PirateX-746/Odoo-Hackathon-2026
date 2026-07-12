# TransitOps API

Backend for **TransitOps — Smart Transport Operations Platform**: vehicle, driver, trip/dispatch, maintenance, and fuel/expense management with enforced business rules and operational analytics. Built with NestJS 11, Prisma 7 (Postgres, driver-adapter client), and JWT-based RBAC.

## Prerequisites

- Node.js 20+
- A reachable PostgreSQL database

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` and set `DATABASE_URL` to your Postgres connection string (plus JWT secrets for anything beyond local dev). Then apply the schema and seed demo data:

```bash
npm run prisma:deploy   # applies the committed migration
npm run prisma:seed     # idempotent — safe to re-run
```

## Running

```bash
npm run start:dev   # watch mode, http://localhost:4000
npm run build && npm run start:prod
```

Swagger UI is served at `http://localhost:4000/api/docs` (gated by `SWAGGER_ENABLED` in `.env`). The full OpenAPI spec is also committed at [`docs/openapi.json`](./docs/openapi.json) — regenerate it after any API change with:

```bash
npm run docs:generate
```

## Seeded accounts

`npm run prisma:seed` creates one user per role, all sharing the password `Password123!`:

| Role | Email |
|---|---|
| Admin | `admin@transitops.dev` |
| Fleet Manager | `fleet.manager@transitops.dev` |
| Safety Officer | `safety.officer@transitops.dev` |
| Financial Analyst | `finance.analyst@transitops.dev` |
| Driver | `driver.demo@transitops.dev` |

`POST /api/auth/login` with one of these returns an `accessToken` — pass it as `Authorization: Bearer <token>` on subsequent requests (or click "Authorize" in Swagger UI).

## Project structure

- `prisma/schema.prisma` — data model (Users/RBAC, Vehicles, Drivers, Trips, MaintenanceLogs, FuelLogs, Expenses)
- `prisma/seed.ts` — idempotent demo data covering every status/role combination
- `src/<module>/` — one NestJS module per resource (`auth`, `users`, `vehicles`, `drivers`, `trips`, `maintenance`, `fuel-logs`, `expenses`, `reports`, `dashboard`, `insights`, `dispatch-assistant`), each with its own controller/service/DTOs
- `src/common/` — shared guards (`JwtAuthGuard`, `RolesGuard`), decorators (`@Public()`, `@Roles()`, `@CurrentUser()`), exception filters, pagination helpers
- `src/prisma/prisma.service.ts` — Prisma Client wired to the `@prisma/adapter-pg` driver adapter (required by Prisma 7)
- `src/ai/anthropic.service.ts` — shared Claude API wrapper used by the AI features below

## AI features

Two advisory features built on the Anthropic API (`@anthropic-ai/sdk`, model `claude-opus-4-8`), both read-only and both requiring `ANTHROPIC_API_KEY` in `.env` — without it, they return `503 Service Unavailable` and the rest of the app is unaffected:

- **`GET /api/insights/summary`** (accepts the same `region`/`type`/`status` filters as Reports/Dashboard) — a natural-language executive summary generated from live KPI and vehicle-report data. Cached for 60s.
- **`GET /api/trips/dispatch/recommendations?source=&destination=&cargoWeightKg=&plannedDistanceKm=&region=`** — recommends up to 3 vehicle+driver pairings for a prospective trip, each with a rationale. The candidate pool is filtered deterministically in code (dispatch-eligible + sufficient capacity) before the model ever sees it, and the model's response is re-validated against that same candidate set before being returned — the AI can rank and explain, but it can never surface an infeasible pairing. It does not create or dispatch a trip; that still goes through the normal `POST /api/trips` flow and its full business-rule validation.

## Business rules enforced

- Vehicle registration numbers and driver license numbers are unique.
- Retired/In Shop/On Trip vehicles and Suspended/expired-license drivers never appear in the dispatch-eligible pools (`GET /vehicles/dispatch-eligible`, `GET /drivers/dispatch-eligible`).
- Cargo weight can't exceed a vehicle's max load capacity (creation and dispatch both check this).
- Dispatch/complete/cancel and maintenance open/close all run inside Prisma interactive transactions using conditional `updateMany` compare-and-swap guards, so concurrent state changes on the same vehicle/driver resolve to a `409 Conflict` instead of corrupting data.

## Scripts

| Script | Purpose |
|---|---|
| `npm run start:dev` | Run with hot reload |
| `npm run build` | Compile to `dist/` |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` / `test:e2e` | Jest unit / e2e tests |
| `npm run prisma:migrate` | Create a new migration (dev) |
| `npm run prisma:deploy` | Apply committed migrations |
| `npm run prisma:seed` | Seed demo data |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run docs:generate` | Rebuild and export `docs/openapi.json` |
