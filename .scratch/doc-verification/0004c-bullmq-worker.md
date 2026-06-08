# 0004c — BullMQ Worker — pick job, call mock service, retry/backoff

**Label:** ready-for-agent
**Type:** AFK
**Blocked by:** #0003, #0004b

**Ref (API):** `@docs/api-impl-structure.md`

## What to build

BullMQ worker that processes verification jobs: calls the Mock Verification Service, handles rate limit responses and failures, and implements the retry strategy from `docs/system-design.md`.

**Worker flow:**

1. Pick job from queue
2. Idempotency check: `SELECT status FROM documents WHERE id = documentId` — if status ≠ `processing`, skip (return early)
3. Update document status: `pending → processing`
4. `POST VERIFICATION_SERVICE_URL/verify` with `{ documentId, callbackUrl: API_URL/internal/webhook }`
5. On 202: store `verificationId` in document record, wait for webhook callback
6. On 429: `DELAY 60s` without counting as an attempt (BullMQ `moveToDelayed`)
7. On 5xx/timeout/network error: let BullMQ retry with exponential backoff

**BullMQ config:**

```
attempts: 4
backoff: { type: 'exponential', delay: 30000 }
rateLimiter: { max: 100, duration: 60000 }
```

**On exhausted retries:**

- Update document status to `error`
- Insert audit_log: `action_type = auto`, `actor_type = system`, `next_status = error`

**Admin endpoints:**

- `GET /admin/documents` (admin) — list all documents, filter by `?status=`
- `POST /admin/documents/:id/retry` (admin) — re-enqueue job, reset status to `processing`

## Acceptance criteria

- [x] Worker picks jobs from BullMQ queue and calls mock service
- [x] Document status updates from `pending` to `processing` when job is picked up
- [x] `verificationId` is stored on the document record after mock service responds 202
- [x] 429 response delays job 60s without consuming an attempt
- [x] After 4 failed attempts, document status = `error` and audit log is inserted
- [x] `POST /admin/documents/:id/retry` re-enqueues and resets status to `processing`
- [x] Worker does not call mock service if document status ≠ `processing` (idempotency layer 1)
