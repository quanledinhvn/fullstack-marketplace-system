# API Structure — apps/api

Stack: NestJS + Prisma + PostgreSQL + BullMQ

---

## Folder Structure

```
apps/api/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── config/
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   ├── jwt.config.ts
│   │   └── index.ts
│   │
│   ├── database/
│   │   ├── prisma.module.ts
│   │   ├── prisma.service.ts
│   │   └── prisma.health.ts
│   │
│   ├── queue/
│   │   ├── queue.module.ts
│   │   ├── queue.constants.ts
│   │   └── redis.provider.ts
│   │
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── public.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── filters/
│   │   │   ├── all-exceptions.filter.ts
│   │   │   └── prisma-exceptions.filter.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   ├── response-transform.interceptor.ts
│   │   │   └── timeout.interceptor.ts
│   │   ├── pipes/
│   │   │   └── zod-validation.pipe.ts
│   │   └── types/
│   │       ├── pagination.type.ts
│   │       └── response.type.ts
│   │
│   ├── health/
│   │   ├── health.module.ts
│   │   └── health.controller.ts
│   │
│   └── modules/
│       ├── auth/
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── strategies/
│       │   │   ├── jwt.strategy.ts
│       │   │   └── local.strategy.ts
│       │   └── dto/
│       │       ├── login.dto.ts
│       │       └── register.dto.ts
│       │
│       ├── users/
│       │   ├── users.module.ts
│       │   ├── users.controller.ts
│       │   ├── users.service.ts
│       │   ├── users.repository.ts
│       │   └── dto/
│       │       ├── create-user.dto.ts
│       │       ├── update-user.dto.ts
│       │       └── user-query.dto.ts
│       │
│       └── notifications/
│           ├── notifications.module.ts
│           ├── notifications.service.ts
│           ├── notifications.producer.ts
│           ├── notifications.consumer.ts
│           └── dto/
│               └── send-notification.dto.ts
│
├── test/
│   ├── e2e/
│   │   └── users.e2e-spec.ts
│   └── jest-e2e.json
│
├── .env
├── .env.example
├── nest-cli.json
├── package.json
└── tsconfig.json
```

---

## Layer Responsibilities

| Layer          | File                 | Responsibility                                               |
| -------------- | -------------------- | ------------------------------------------------------------ |
| **Controller** | `*.controller.ts`    | Handle HTTP requests, validate DTOs, delegate to Service     |
| **Service**    | `*.service.ts`       | Business logic, orchestrate Repository and Queue calls       |
| **Repository** | `*.repository.ts`    | Prisma queries only, no business logic                       |
| **Producer**   | `*.producer.ts`      | Push jobs into BullMQ queues                                 |
| **Consumer**   | `*.consumer.ts`      | Worker that processes jobs from the queue asynchronously     |
| **Config**     | `config/*.config.ts` | Centralized, typed environment variables                     |
| **Common**     | `common/`            | Cross-cutting concerns: guards, filters, interceptors, pipes |
