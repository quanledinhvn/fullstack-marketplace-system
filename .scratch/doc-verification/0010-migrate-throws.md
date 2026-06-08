# 0010 — Migrate existing throws to App\*Exception

**Label:** ready-for-agent
**Type:** AFK
**Blocked by:** 0009

## What to build

Replace all NestJS built-in exception throws (`UnauthorizedException`, `ForbiddenException`, `NotFoundException`, `BadRequestException`) in guards and services with the corresponding `App*Exception` subclasses. The existing `AppExceptionsFilter` remains active — no behavior change visible to callers.

Files to migrate:

- `apps/api/src/common/guards/user-id.guard.ts` — `UnauthorizedException` → `AppUnauthorizedException`
- `apps/api/src/common/guards/roles.guard.ts` — `ForbiddenException` → `AppNotAllowedException`
- `apps/api/src/modules/auth/auth.service.ts`
- `apps/api/src/modules/documents/documents.service.ts`
- `apps/api/src/modules/verification/verification.service.ts`

## Acceptance criteria

- [x] No import of `UnauthorizedException`, `ForbiddenException`, `NotFoundException`, or `BadRequestException` from `@nestjs/common` remains in the five files above
- [x] All throws use `App*Exception` classes from `apps/api/src/common/exceptions/exception.ts`
- [x] Existing HTTP response codes and messages unchanged (401 still 401, 403 still 403, etc.)
- [x] API integration tests (if any) still pass

## Blocked by

- 0009
