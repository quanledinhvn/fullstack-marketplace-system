# Document Verification Workflow

---

## What I built

**Stack:** NestJS + Prisma + PostgreSQL + BullMQ · React + Vite + TanStack Router + Zustand

**Works end-to-end:**

- Seller login → upload document → see status
- BullMQ job dispatched on upload → mock verification service called → webhook updates status
- Admin login → see all documents (filterable by status)

**Partial / stubbed:**

- Admin review of `inconclusive` documents (approve/reject) — not yet built
- Seller notification — hook point exists, no email sent
- Mock service enforces 100 req/min rate limit and random delay; no real external call
- No file content validation beyond MIME type and size

---

## What I'd build next

1. **Admin review** — `POST /admin/documents/:id/review` → approve/reject `inconclusive`; admin UI action buttons
2. **Admin retry** — `POST /admin/documents/:id/retry` → re-enqueue `error` docs; reset attempt count
3. **Admin stats** — `GET /admin/documents/stats` → count by status (error, inconclusive, …)
4. **Audit log endpoint** — `GET /admin/documents/:id/audit-logs` → full history per document
5. **Seller re-upload** — allow new upload only when status is `rejected`; create new record, keep old
6. **Seller notification** — email on `VERIFIED` / `REJECTED`; hook point exists, no transport wired

---

## How to run it

### Prerequisites

- Node `^20.19.0 || >=22.12.0`
- pnpm `9.x` (`corepack enable`)
- Docker + Docker Compose

### Local

```bash
pnpm install

# Start Postgres + Redis
docker compose -f docker-compose.db.yml up -d

# Copy env and seed
cp apps/api/.env.example apps/api/.env
pnpm --filter api prisma migrate dev
pnpm --filter api prisma db seed

# Run both apps
pnpm dev       # API → :3001   Web → :3000
```

### Deployed URLs

- **Frontend:** https://fullstack-marketplace-system-api.vercel.app/login
- **API:** https://fullstack-marketplace-system-production.up.railway.app
- **Mock service:** https://mock-service-production-3e6d.up.railway.app

---

## Seeded credentials

| Role   | Email            | Password    |
| ------ | ---------------- | ----------- |
| Seller | seller1@test.com | password123 |
| Seller | seller2@test.com | password123 |
| Seller | seller3@test.com | password123 |
| Admin  | admin1@test.com  | password123 |
| Admin  | admin2@test.com  | password123 |
| Admin  | admin3@test.com  | password123 |
