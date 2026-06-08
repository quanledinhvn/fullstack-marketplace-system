# 0003 — Mock Verification Service

**Label:** ready-for-agent
**Type:** AFK
**Blocked by:** #0001

## What to build

Standalone Express app (`apps/mock-service`) simulating the external verification service. The main API treats it as a black box — only `VERIFICATION_SERVICE_URL` in `.env` changes between mock and real.

**Endpoints:**

- `POST /verify` — body: `{ documentId, callbackUrl }` → 202 `{ verificationId }`, or 429 `{ error, retryAfter }` if over 100 req/min
- `GET /health` → 200 `{ ok: true }`

**Behavior:**

- In-memory rate limiter: max 100 req/min, resets every 60s
- On accept: fire-and-forget `processAsync()` — random delay 2000–30000ms, random result from `['verified', 'rejected', 'inconclusive']`
- After delay: `POST callbackUrl` with `{ verificationId, documentId, result }`

**Structure:**

```
apps/mock-service/
├── src/
│   ├── index.ts       # Express app setup + routes
│   ├── rate-limiter.ts
│   └── processor.ts   # processAsync()
├── package.json
└── tsconfig.json
```

## Acceptance criteria

- [x] `POST /verify` returns 202 with a `verificationId`
- [x] After random delay, `callbackUrl` receives `POST { verificationId, documentId, result }`
- [x] 101st request within 60s window returns 429 with `retryAfter`
- [x] Counter resets after 60s
- [x] `GET /health` returns 200
- [x] Service starts with `pnpm dev` from `apps/mock-service`
