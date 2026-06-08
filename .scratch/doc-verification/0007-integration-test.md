# 0007 — Integration test — webhook handler with Docker Compose Postgres

**Label:** ready-for-agent
**Type:** AFK
**Blocked by:** #0004d

## What to build

Integration tests for `POST /internal/webhook` running against real PostgreSQL via Docker Compose. No Prisma mocks.

**Test setup:**

- `docker compose up -d` before test suite (Postgres on port 5432)
- Migrate + seed test DB before tests (`prisma migrate deploy` + seed)
- Truncate `documents` and `audit_logs` between tests

**Test cases:**

1. **Happy path — verified:** Insert document with `status = processing`, POST webhook with `result = verified` → document status = `verified`, audit log row with `prev_status = processing`, `next_status = verified`, `actor_type = system`

2. **Happy path — rejected:** Same as above with `result = rejected`

3. **Happy path — inconclusive:** Same with `result = inconclusive`

4. **Idempotency:** Insert document with `status = verified`, POST webhook again → returns 200, document status unchanged, no new audit log row

5. **Unknown verificationId:** POST webhook with non-existent `verificationId` → returns 404 (or 200 no-op, document which approach)

**Test runner:** Jest or Vitest (whichever `apps/api` uses). Config in `test/jest-e2e.json`.

## Acceptance criteria

- [x] Tests run with `pnpm test:integration` (or similar) from `apps/api`
- [x] All 4 happy path + idempotency tests pass against real Postgres
- [x] Tests are isolated — one test's data does not affect another
- [x] CI-ready: tests can run in any environment with Docker available
