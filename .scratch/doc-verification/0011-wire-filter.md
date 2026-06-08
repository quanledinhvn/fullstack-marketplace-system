# 0011 — Wire GlobalHandleExceptionFilter + ValidationPipe

**Label:** ready-for-agent
**Type:** AFK
**Blocked by:** 0010

## What to build

Replace the current `AppExceptionsFilter` with `GlobalHandleExceptionFilter` backed by Winston. All throws already use `App*Exception` (from 0010) so the filter switch is safe with no regression risk.

- Create `apps/api/src/common/filters/exception.filter.ts` — `GlobalHandleExceptionFilter` with three branches: `AppException` → `prepareResponse()`, NestJS `NotFoundException` → `AppNotRouteFoundError`, anything else → `AppInternalServerError` (with stack in `data` if `ENABLE_VERBOSE_ERR_RESPONSE=true`)
- Delete `apps/api/src/common/filters/all-exceptions.filter.ts`
- Update `apps/api/src/app.module.ts`: import `WinstonModule.forRootAsync` (reads `ConfigService.get('log')`), register `GlobalHandleExceptionFilter` via `APP_FILTER` token
- Update `apps/api/src/main.ts`: remove `app.useGlobalFilters(new AppExceptionsFilter())`, add `exceptionFactory: (errors) => AppBadRequestException.fromValidationErrors(errors)` to `ValidationPipe`
- Add `ENABLE_VERBOSE_ERR_RESPONSE=true` to `.env.development`

## Acceptance criteria

- [x] `all-exceptions.filter.ts` deleted; `exception.filter.ts` is the only exception filter
- [x] HTTP 4xx responses return `{ statusCode, message }` (no `path`, no `timestamp`)
- [x] HTTP 4xx responses with field errors return `{ statusCode, message, data: { field: { constraint } } }`
- [x] Unhandled errors return `{ statusCode: 500, message: "Internal Server Error" }` in production mode
- [x] With `ENABLE_VERBOSE_ERR_RESPONSE=true`, 500 response includes `data: <stackTrace>`
- [x] Winston logs 4xx as `warn`, 5xx as `error` with `{ error, http }` structured fields
- [x] DTO validation failure returns `400` with per-field error map (not NestJS default format)

## Blocked by

- 0010
