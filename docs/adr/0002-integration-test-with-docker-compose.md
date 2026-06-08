# ADR 0002 — Integration Test for Webhook Handler Using Docker Compose

**Status:** Accepted

## Context

The take-home requires "at least one meaningful test of the core behavior." The core behavior is the state machine transition triggered by the webhook callback: `PROCESSING → VERIFIED/REJECTED/INCONCLUSIVE`, with audit log insertion and idempotency guard.

## Decision

Write an integration test for the webhook handler (`POST /internal/webhook`) that runs against a real PostgreSQL instance provided by Docker Compose. No Prisma mocks.

The test verifies:

1. A document in `PROCESSING` status transitions correctly on valid webhook payload.
2. Audit log row is inserted with correct `prev_status`, `next_status`, `actor_type = system`.
3. A duplicate webhook call (same `verificationId`, document no longer `PROCESSING`) is ignored — returns 200 and does not mutate state.

## Consequences

- Test requires Docker to run (`docker compose up -d` before test suite).
- Slower than a mocked unit test (~seconds vs milliseconds), but tests real Prisma query behavior.
- Catches DB constraint issues and query bugs that mocks would hide.

## Rejected Alternative

Unit test with mocked Prisma client. Rejected because the idempotency guard and audit log insertion are tightly coupled to real DB transaction semantics — mocking them provides false confidence.
