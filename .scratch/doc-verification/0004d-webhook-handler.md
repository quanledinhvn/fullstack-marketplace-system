# 0004d — Webhook handler — state machine transitions, audit log, idempotency

**Label:** ready-for-agent
**Type:** AFK
**Blocked by:** #0004c

**Ref (API):** `@docs/api-impl-structure.md`

## What to build

`POST /internal/webhook` endpoint that receives verification results from the Mock Service and drives the document state machine.

**Endpoint:** `POST /internal/webhook`

- Body: `{ verificationId: string, documentId: string, result: 'verified' | 'rejected' | 'inconclusive' }`
- No auth (server-to-server, internal only)

**Flow:**

1. Lookup document by `verification_id`
2. Idempotency check: if `status ≠ processing` → return 200 OK, no-op
3. Update document status: `processing → verified | rejected | inconclusive`
4. Insert audit_log: `action_type = auto`, `actor_type = system`, `actor_id = null`, `prev_status = processing`, `next_status = <result>`
5. If terminal state (verified | rejected): call `NotificationsService.send()` (console.log stub)

**State machine guards:**

- Only `processing` documents can be transitioned by webhook
- `verified` and `rejected` are terminal — no further transitions

## Acceptance criteria

- [x] `POST /internal/webhook` with `result = verified` updates document to `verified`
- [x] `POST /internal/webhook` with `result = rejected` updates document to `rejected`
- [x] `POST /internal/webhook` with `result = inconclusive` updates document to `inconclusive`
- [x] Audit log row inserted with correct `prev_status`, `next_status`, `actor_type = system`
- [x] Duplicate webhook call (document no longer `processing`) returns 200 and does not mutate DB
- [x] Console.log notification fires for `verified` and `rejected` outcomes
- [x] `GET /admin/documents/:id/audit-logs` returns full audit history
