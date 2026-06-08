# 0004a — DB Schema — Prisma schema, migration, seed extension

**Label:** ready-for-agent
**Type:** AFK
**Blocked by:** #0001

## What to build

Define the full Prisma schema for the verification workflow and run the initial migration. Extend the seed to cover document-related test data if needed.

**Models (from `docs/system-design.md`):**

`users` — id (uuid), email (unique), password_hash, name, role (seller|admin), status (active|deleted), created_at, updated_at

`documents` — id (uuid), user_id (FK), verification_id (nullable), job_id (nullable), file_url, file_name, file_size, status (pending|processing|verified|rejected|inconclusive|error), created_at, updated_at

`audit_logs` — id (uuid), document_id (FK), action_type (auto|manual), actor_id (nullable FK), actor_type (system|admin|seller), prev_status (nullable), next_status, reason (nullable), created_at

**Indexes:**

- `documents.user_id`
- `documents.status`
- `documents.verification_id`
- `documents.(user_id, status)` composite
- `audit_logs.document_id`

## Acceptance criteria

- [x] `pnpm prisma migrate dev` runs without errors against local Docker Compose Postgres
- [x] All three tables exist with correct columns and types
- [x] All indexes are created
- [x] `pnpm prisma db seed` runs without errors (users seeded from #0002)
- [x] Prisma client generated and importable in `apps/api`
