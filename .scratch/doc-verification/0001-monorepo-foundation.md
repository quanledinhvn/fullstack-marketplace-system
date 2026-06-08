# 0001 — Monorepo foundation

**Label:** done
**Type:** AFK
**Blocked by:** None — can start immediately

## What to build

Set up the shared packages and local dev infrastructure that every other slice depends on.

- `packages/shared` (`@app/shared`) — TypeScript interfaces for API shapes: `User`, `Document`, `AuditLog`, `DocumentStatus` enum, `ApiResponse<T>`, pagination types.
- `docker-compose.yml` at repo root — Postgres + Redis services for local dev. Ports: 5432, 6379.
- Wire `@app/shared` as `workspace:*` dependency in `apps/api` and `apps/web`.

## Acceptance criteria

- [x] `pnpm install` succeeds across the workspace
- [x] `@app/shared` exports `DocumentStatus` enum and core entity types
- [x] `docker compose up -d` starts Postgres and Redis with no errors
- [x] `apps/api` can import from `@app/shared` without TS errors
- [x] `apps/web` can import from `@app/shared` without TS errors
