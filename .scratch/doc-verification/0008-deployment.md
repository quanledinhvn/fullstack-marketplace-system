# 0008 — Deployment — Railway (api + mock + infra) + Vercel (web)

**Label:** ready-for-agent
**Type:** AFK
**Blocked by:** #0005, #0006, #0007

## What to build

Production deployment configuration for all services.

**Railway (one project, multiple services):**

- `api` service — NestJS, buildpack or Dockerfile
- `mock-service` service — Express
- `postgres` service — Railway managed Postgres plugin
- `redis` service — Railway managed Redis plugin

**Vercel:**

- `web` service — Vite React app
- `VITE_API_URL` env var pointing to Railway API URL

**Environment variables:**

`apps/api/.env.example`:

```
DATABASE_URL=
REDIS_URL=
JWT_SECRET=
VERIFICATION_SERVICE_URL=
API_URL=   # public URL of this API (used as callbackUrl)
PORT=3000
```

`apps/mock-service/.env.example`:

```
PORT=3001
```

`apps/web/.env.example`:

```
VITE_API_URL=
```

**README.md** must include:

- What I built / what's partial / what's stubbed
- How to run locally (docker compose + seed + start commands)
- Deployed URL (Railway API + Vercel web)
- Seeded credentials (seller@test.com / admin@test.com, both password123)
- What I'd build next

## Acceptance criteria

- [ ] `apps/api` deploys and starts on Railway
- [ ] `apps/mock-service` deploys and starts on Railway
- [ ] `apps/web` deploys on Vercel and connects to Railway API
- [ ] End-to-end flow works on public URLs: login → upload → see status update
- [ ] `.env.example` files exist for all three apps, no secrets committed
- [ ] `README.md` covers all required sections from kvy_tech.md
