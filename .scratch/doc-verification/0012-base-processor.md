# 0012 — BaseProcessor (BullMQ)

**Label:** ready-for-agent
**Type:** AFK
**Blocked by:** 0009

## What to build

Create an abstract `BaseProcessor` that all BullMQ workers extend. It handles Winston logging per job (with `traceId`) and maps exception types to the correct BullMQ outcome: business errors stop retry immediately, system errors let BullMQ retry per queue config.

- Create `apps/api/src/queue/base.processor.ts` extending `WorkerHost` from `@nestjs/bullmq`
- Constructor injects `WINSTON_MODULE_PROVIDER` logger
- `process()` wraps `execute()` with structured Winston logging (`Starting job`, `Completed job` with `durationMs`) and `traceId` on each log entry
- `handleError()` logic:
  - `AppException` with status < 500 → `throw new UnrecoverableError(message)` (job → `failed`, no retry)
  - Anything else → re-throw (BullMQ retries per queue config: 4 attempts, exponential backoff)
- Subclasses implement only `execute(job)`

## Acceptance criteria

- [x] `BaseProcessor` exported from `apps/api/src/queue/base.processor.ts`
- [x] Business error (e.g. `AppNotFoundException`) thrown inside `execute()` → job moves to `failed` set without retry
- [x] System error (e.g. `new Error('timeout')`) thrown inside `execute()` → BullMQ retries up to configured max attempts
- [x] Each job logs `Starting job` on entry and `Completed job` (with `durationMs`) on success
- [x] Each log entry includes a `traceId` unique to the job run

## Blocked by

- 0009
