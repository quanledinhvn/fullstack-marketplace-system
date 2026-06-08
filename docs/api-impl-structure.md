# API Implementation Structure — apps/api

Stack: NestJS + Prisma + PostgreSQL + BullMQ + class-validator + class-transformer

---

## Auth Strategy

**Simplified header-based auth** — no JWT, no Passport.

Client sends: `Authorization: <userId>` (plain UUID from seed).

`UserIdGuard` reads the header, queries DB for the user, attaches to request as `@CurrentUser()`.  
`RolesGuard` checks `user.role` against `@Roles()` decorator.

Login endpoint (`POST /auth/login`) exists only to let the UI exchange email+password for a userId:

- Finds user by email, bcrypt-compares password
- Returns `{ userId, role, name, email }` — no token signing

---

## Folder Structure

```
apps/api/
├── prisma/
│   ├── schema.prisma               # users, documents, audit_logs
│   ├── migrations/
│   └── seed.ts                     # seller@test.com + admin@test.com (password123)
│
├── src/
│   ├── main.ts                     # bootstrap, global ValidationPipe, global guards
│   ├── app.module.ts
│   │
│   ├── config/
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   └── index.ts
│   │
│   ├── database/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   │
│   ├── queue/
│   │   ├── queue.module.ts
│   │   ├── queue.constants.ts      # VERIFICATION_QUEUE = 'verification'
│   │   └── redis.provider.ts
│   │
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts   # @CurrentUser() → User from request
│   │   │   ├── public.decorator.ts         # @Public() → skip UserIdGuard
│   │   │   └── roles.decorator.ts          # @Roles('seller' | 'admin')
│   │   ├── filters/
│   │   │   ├── all-exceptions.filter.ts    # strips internal details from responses
│   │   │   └── prisma-exceptions.filter.ts
│   │   ├── guards/
│   │   │   ├── user-id.guard.ts            # reads Authorization header, lookups user
│   │   │   └── roles.guard.ts              # checks user.role vs @Roles()
│   │   ├── interceptors/
│   │   │   ├── response-transform.interceptor.ts   # wrap in { data, success }
│   │   │   └── timeout.interceptor.ts
│   │   └── types/
│   │       ├── pagination.type.ts
│   │       └── response.type.ts
│   │
│   ├── health/
│   │   ├── health.module.ts
│   │   └── health.controller.ts    # GET /health
│   │
│   └── modules/
│       │
│       ├── auth/
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts      # POST /auth/login (@Public)
│       │   ├── auth.service.ts         # validateUser(), returns { userId, role, name, email }
│       │   └── dto/
│       │       └── login.dto.ts        # { email: string, password: string }
│       │
│       ├── users/
│       │   ├── users.module.ts
│       │   ├── users.service.ts        # findByEmail(), findById()
│       │   └── users.repository.ts
│       │
│       ├── documents/                  # seller-facing
│       │   ├── documents.module.ts
│       │   ├── documents.controller.ts
│       │   │   # POST   /documents          @Roles('seller')
│       │   │   # GET    /documents          @Roles('seller')
│       │   │   # GET    /documents/:id      @Roles('seller')
│       │   ├── documents.service.ts
│       │   │   # upload()             → create record + enqueue job
│       │   │   # list()               → seller's own documents
│       │   │   # findOne()            → with ownership check
│       │   │   # transitionStatus()   → update status + insert audit_log
│       │   ├── documents.repository.ts
│       │   └── dto/
│       │       ├── upload-document.dto.ts      # { fileName, fileSize, mimeType }
│       │       └── document-query.dto.ts       # { status?, page?, limit? }
│       │
│       ├── admin/
│       │   ├── admin.module.ts
│       │   ├── admin.controller.ts
│       │   │   # GET  /admin/documents          @Roles('admin')
│       │   │   # POST /admin/documents/:id/retry @Roles('admin')
│       │   ├── admin.service.ts
│       │   │   # listAll()    → all documents, filter by status
│       │   │   # retry()      → re-enqueue job, status → processing
│       │   └── dto/
│       │       └── admin-document-query.dto.ts # { status?, page?, limit? }
│       │
│       ├── internal/                   # server-to-server, no auth guard
│       │   ├── internal.module.ts
│       │   ├── internal.controller.ts
│       │   │   # POST /internal/webhook   (@Public)
│       │   ├── internal.service.ts
│       │   │   # handleWebhook()
│       │   │   #   1. lookup by verificationId
│       │   │   #   2. idempotency: status ≠ processing → 200 no-op
│       │   │   #   3. delegate to documents.service.transitionStatus()
│       │   │   #   4. notify if terminal state
│       │   └── dto/
│       │       └── webhook.dto.ts      # { verificationId, documentId, result }
│       │
│       ├── verification/
│       │   ├── verification.module.ts
│       │   ├── verification.producer.ts
│       │   │   # enqueueJob(documentId)  → BullMQ add()
│       │   ├── verification.consumer.ts
│       │   │   # @Process() worker:
│       │   │   #   1. idempotency: status ≠ processing → skip
│       │   │   #   2. callMockService()
│       │   │   #   3. on 429 → moveToDelayed(60s), no attempt count
│       │   │   #   4. on 5xx → throw (BullMQ retries with backoff)
│       │   │   #   5. on exhausted → status = error + audit_log
│       │   └── verification.service.ts
│       │       # callMockService(documentId, callbackUrl)
│       │       #   POST VERIFICATION_SERVICE_URL/verify
│       │       #   returns { verificationId }
│       │
│       └── notifications/
│           ├── notifications.module.ts
│           └── notifications.service.ts
│               # send(userId, status, reason?)
│               # → console.log stub

├── test/
│   ├── integration/
│   │   └── webhook.integration-spec.ts
│   └── jest-e2e.json

├── .env.example
├── nest-cli.json
├── package.json
└── tsconfig.json
```

---

## Layer Responsibilities

| Layer          | File              | Responsibility                                       |
| -------------- | ----------------- | ---------------------------------------------------- |
| **Controller** | `*.controller.ts` | HTTP in/out, DTO binding, delegate to Service        |
| **Service**    | `*.service.ts`    | Business logic, orchestrate Repository + Producer    |
| **Repository** | `*.repository.ts` | Prisma queries only, no business logic               |
| **Producer**   | `*.producer.ts`   | Push jobs to BullMQ                                  |
| **Consumer**   | `*.consumer.ts`   | Process jobs from BullMQ queue                       |
| **Guard**      | `common/guards/`  | Auth (UserIdGuard) + RBAC (RolesGuard)               |
| **Filter**     | `common/filters/` | Exception → safe HTTP response (no internals leaked) |

---

## Validation

Use NestJS built-in `ValidationPipe` globally with `class-validator` + `class-transformer`.

```ts
// main.ts
app.useGlobalPipes(
	new ValidationPipe({
		whitelist: true,
		forbidNonWhitelisted: true,
		transform: true,
	}),
);
```

DTOs use decorators:

```ts
// login.dto.ts
export class LoginDto {
	@IsEmail()
	email: string;

	@IsString()
	@MinLength(6)
	password: string;
}
```

---

## BullMQ Config

```ts
{
  attempts: 4,
  backoff: { type: 'exponential', delay: 30_000 },
  rateLimiter: { max: 100, duration: 60_000 },
}
```

---

## Environment Variables (`.env.example`)

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/marketplace
REDIS_URL=redis://localhost:6379
VERIFICATION_SERVICE_URL=http://localhost:3001
API_URL=http://localhost:3000
PORT=3000
```
