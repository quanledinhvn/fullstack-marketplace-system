# 0009 — App\*Exception class library

**Label:** ready-for-agent
**Type:** AFK
**Blocked by:** None — can start immediately

## What to build

Install `nest-winston` + `winston` and create the shared exception class hierarchy that every other exception-handling slice depends on. No behavior change to existing request/response flow.

- Install `nest-winston` and `winston` packages in `apps/api`
- Create `apps/api/src/common/exceptions/exception.ts` with `AppException` base class and all subclasses: `AppBadRequestException` (with `fromValidationErrors` static factory), `AppUnauthorizedException`, `AppNotAllowedException`, `AppNotFoundException`, `AppNotRouteFoundError`, `AppInternalServerError`, `AppServiceUnavailableServerError`
- Create `apps/api/src/config/log.config.ts` — Winston options loaded via `ConfigService` with Console transport, JSON format for `NODE_ENV=production`, colorized simple format otherwise

Response shape for all exceptions (enforced by `prepareResponse()`):

```
{ statusCode: number, message: string, data?: unknown }
```

## Acceptance criteria

- [x] `pnpm install` succeeds, `nest-winston` and `winston` present in `apps/api/package.json`
- [x] `AppException` and all subclasses export from `apps/api/src/common/exceptions/exception.ts`
- [x] `AppBadRequestException.fromValidationErrors(errors)` returns correct `{ statusCode: 400, message: "Validation failed", data: { field: { constraint: "..." } } }`
- [x] `logConfig` exports from `apps/api/src/config/log.config.ts` and registers as `'log'` namespace with `registerAs`
- [x] No existing tests or runtime behavior changed (filter still `AppExceptionsFilter`)

## Blocked by

None — can start immediately
