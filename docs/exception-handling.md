# Exception Handling — AppException & GlobalHandleExceptionFilter

---

## Flow tổng quan

```
HTTP Request
     ↓
NestJS Controller
     ↓
Service / Command / Query throws Exception
     ↓
GlobalHandleExceptionFilter.catch()
     ↓
┌────────────────────┬────────────────────┬──────────────────┐
│  AppException?     │  NotFoundException? │  Anything else?  │
│  (instanceof)      │  (NestJS built-in) │                  │
↓                    ↓                    ↓
prepareResponse()  AppNotRouteFoundError  AppInternalServerError(500)
     ↓                   ↓                    ↓
     └──────── response.status(X).json({statusCode, message, data?}) ───┘

Đồng thời: logger.warn (4xx) hoặc logger.error (5xx)
```

BullMQ Queue:

```
Worker Job throws Exception
     ↓
BaseProcessor.handleError()
     ↓
┌─────────────────────┬──────────────────────┐
│  App4xxException?   │  Anything else?       │
│  (business error)   │  (system error)       │
↓                     ↓
throw UnrecoverableError  re-throw (BullMQ retries)
(job → failed, no retry)
```

---

## Response Format (cố định)

Mọi HTTP exception đều trả về cùng một format:

```json
{
	"statusCode": 400,
	"message": "Validation failed",
	"data": { "email": { "isEmail": "email must be an email" } }
}
```

```typescript
interface AppExceptionInformation {
	statusCode: number;
	message: string;
	data?: unknown;
}
```

> Không có `path` hay `timestamp` trong response — debug qua Winston server logs.

---

## File Structure

```
apps/api/src/
├── common/
│   ├── exceptions/
│   │   └── exception.ts          ← AppException + subclasses
│   └── filters/
│       └── exception.filter.ts   ← GlobalHandleExceptionFilter (replaces all-exceptions.filter.ts)
├── queue/
│   └── base.processor.ts         ← BaseProcessor abstract class
└── config/
    └── log.config.ts             ← Winston config (transports, format)
```

---

## Exception Classes

### File: `apps/api/src/common/exceptions/exception.ts`

```typescript
import type { ValidationError } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';

export interface AppExceptionInformation {
	statusCode: number;
	message: string;
	data?: unknown;
}

// ─── Base ───────────────────────────────────────────────────────────────────

export class AppException extends HttpException {
	private readonly customInformation: AppExceptionInformation;

	constructor(statusCode: HttpStatus, message: string, data?: unknown) {
		super(message, statusCode);
		this.customInformation = { statusCode, message, data };
	}

	prepareResponse(): AppExceptionInformation {
		return { ...this.customInformation };
	}
}

// ─── 400 Bad Request ────────────────────────────────────────────────────────

type DataError = Record<string, Record<string, string> | null>;

export class AppBadRequestException extends AppException {
	constructor(message: string, data?: unknown) {
		super(HttpStatus.BAD_REQUEST, message, data);
	}

	static fromValidationErrors(errors: ValidationError[]): AppBadRequestException {
		const data: DataError = {};
		const parseErrors = (
			errs: ValidationError[],
			result: DataError,
			parentProperty?: string,
		): void => {
			errs.forEach((error) => {
				const property = parentProperty ? `${parentProperty}.${error.property}` : error.property;
				if (error.constraints) {
					result[property] = error.constraints;
				} else if (error.children?.length) {
					parseErrors(error.children, result, property);
				}
			});
		};
		parseErrors(errors, data);
		return new AppBadRequestException('Validation failed', data);
	}
}

// ─── 401 Unauthorized ───────────────────────────────────────────────────────

export class AppUnauthorizedException extends AppException {
	constructor(message: string, data?: unknown) {
		super(HttpStatus.UNAUTHORIZED, message, data);
	}
}

// ─── 403 Forbidden ──────────────────────────────────────────────────────────

export class AppNotAllowedException extends AppException {
	constructor(message: string, data?: unknown) {
		super(HttpStatus.FORBIDDEN, message, data);
	}
}

// ─── 404 Not Found ──────────────────────────────────────────────────────────

export class AppNotFoundException extends AppException {
	constructor(message: string, data?: unknown) {
		super(HttpStatus.NOT_FOUND, message, data);
	}
}

// ─── 404 No Route Found (dùng nội bộ trong filter) ─────────────────────────

export class AppNotRouteFoundError extends AppException {
	constructor() {
		super(HttpStatus.NOT_FOUND, 'No Route Found');
	}
}

// ─── 500 Internal Server Error ──────────────────────────────────────────────

export class AppInternalServerError extends AppException {
	constructor(message?: string, data?: unknown) {
		super(HttpStatus.INTERNAL_SERVER_ERROR, message || 'Internal Server Error', data);
	}
}

// ─── 503 Service Unavailable ────────────────────────────────────────────────

export class AppServiceUnavailableServerError extends AppException {
	constructor(message?: string, data?: unknown) {
		super(HttpStatus.SERVICE_UNAVAILABLE, message || 'Service is not available', data);
	}
}
```

| Class                              | HTTP | Dùng khi                             |
| ---------------------------------- | ---- | ------------------------------------ |
| `AppBadRequestException`           | 400  | Input sai, logic không hợp lệ        |
| `AppUnauthorizedException`         | 401  | Chưa đăng nhập, token hết hạn        |
| `AppNotAllowedException`           | 403  | Không có quyền truy cập              |
| `AppNotFoundException`             | 404  | Resource không tồn tại               |
| `AppNotRouteFoundError`            | 404  | Route không tồn tại (filter tự dùng) |
| `AppInternalServerError`           | 500  | Lỗi hệ thống (filter tự dùng)        |
| `AppServiceUnavailableServerError` | 503  | Service tạm thời không khả dụng      |

---

## GlobalHandleExceptionFilter

### File: `apps/api/src/common/filters/exception.filter.ts`

```typescript
import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpStatus,
	Inject,
	NotFoundException,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import {
	AppException,
	AppInternalServerError,
	AppNotRouteFoundError,
} from '../exceptions/exception';
import type { Response, Request } from 'express';

@Catch()
export class GlobalHandleExceptionFilter implements ExceptionFilter {
	constructor(
		@Inject(WINSTON_MODULE_PROVIDER)
		private readonly logger: Logger,
	) {}

	catch(exception: unknown, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();

		this.logException(request, exception);

		if (exception instanceof AppException) {
			GlobalHandleExceptionFilter.sendResponse(response, exception);
		} else if (exception instanceof NotFoundException) {
			GlobalHandleExceptionFilter.sendResponse(response, new AppNotRouteFoundError());
		} else {
			let error = new AppInternalServerError();
			if (process.env.ENABLE_VERBOSE_ERR_RESPONSE === 'true') {
				error = new AppInternalServerError(
					undefined,
					exception instanceof Error ? exception.stack : String(exception),
				);
			}
			GlobalHandleExceptionFilter.sendResponse(response, error);
		}
	}

	private logException(request: Request, exception: unknown): void {
		const statusCode =
			exception instanceof AppException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

		const level = statusCode < HttpStatus.INTERNAL_SERVER_ERROR ? 'warn' : 'error';
		const message = exception instanceof Error ? exception.message : 'Unhandled exception';

		this.logger.log(level, message, {
			error: {
				kind: exception instanceof Error ? exception.constructor.name : 'UnknownError',
				message,
				stack: exception instanceof Error ? exception.stack : undefined,
			},
			http: {
				method: request.method,
				url: request.url,
				status_code: statusCode,
			},
		});
	}

	private static sendResponse(response: Response, exception: AppException): void {
		response.status(exception.getStatus()).json(exception.prepareResponse());
	}
}
```

---

## Winston Config

### File: `apps/api/src/config/log.config.ts`

```typescript
import { registerAs } from '@nestjs/config';
import * as winston from 'winston';

export const logConfig = registerAs('log', () => ({
	transports: [
		new winston.transports.Console({
			format:
				process.env.NODE_ENV === 'production'
					? winston.format.json()
					: winston.format.combine(winston.format.colorize(), winston.format.simple()),
		}),
	],
}));
```

---

## Đăng ký vào AppModule

```typescript
import { APP_FILTER } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { logConfig } from './config/log.config';
import { GlobalHandleExceptionFilter } from './common/filters/exception.filter';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true, load: [logConfig] }),
		WinstonModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => {
				const logCfg = config.get<Record<string, unknown>>('log');
				if (!logCfg) throw new Error('Cannot start without Log config');
				return logCfg;
			},
		}),
		// ... các module khác
	],
	providers: [
		{
			provide: APP_FILTER,
			useClass: GlobalHandleExceptionFilter,
		},
	],
})
export class AppModule {}
```

> **Lưu ý:** Xóa `app.useGlobalFilters(new AppExceptionsFilter())` khỏi `main.ts`.

---

## ValidationPipe

### File: `apps/api/src/main.ts`

```typescript
app.useGlobalPipes(
	new ValidationPipe({
		whitelist: true,
		forbidNonWhitelisted: true,
		transform: true,
		exceptionFactory: (errors) => AppBadRequestException.fromValidationErrors(errors),
	}),
);
```

---

## BaseProcessor (BullMQ)

### File: `apps/api/src/queue/base.processor.ts`

```typescript
import { randomUUID } from 'node:crypto';
import { WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { Job, UnrecoverableError } from 'bullmq';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { AppException } from '../common/exceptions/exception';

export abstract class BaseProcessor<TData = unknown, TResult = void> extends WorkerHost {
	constructor(
		@Inject(WINSTON_MODULE_PROVIDER)
		protected readonly logger: Logger,
	) {
		super();
	}

	async process(job: Job<TData, TResult>): Promise<TResult | void> {
		const jobName = this.constructor.name;
		const traceId = randomUUID();
		const logger = this.logger.child({ traceId });

		logger.info(`Starting job ${jobName}`, { jobId: job.id, data: job.data });

		try {
			const start = Date.now();
			const result = await this.execute(job);
			logger.info(`Completed job ${jobName}`, { jobId: job.id, durationMs: Date.now() - start });
			return result;
		} catch (error) {
			this.handleError({ error, jobName, job, logger });
		}
	}

	abstract execute(job: Job<TData, TResult>): Promise<TResult | void>;

	private handleError(params: {
		error: unknown;
		jobName: string;
		job: Job<TData, TResult>;
		logger: Logger;
	}): void {
		const { error, jobName, job, logger } = params;
		const logContext = {
			jobName,
			jobId: job.id,
			data: job.data,
			error: error instanceof Error ? error.message : String(error),
		};

		// Business errors (4xx): no retry — move job to failed immediately
		if (error instanceof AppException && error.getStatus() < 500) {
			logger.error(`Business error in job ${jobName}`, logContext);
			throw new UnrecoverableError(error.message);
		}

		// System errors: re-throw so BullMQ retries per queue config
		logger.error(`System error in job ${jobName}`, logContext);
		throw error;
	}
}
```

---

## Cách dùng trong service code

```typescript
// Controller / Service
throw new AppNotFoundException('Document not found');
throw new AppBadRequestException('Invalid status transition');
throw new AppNotAllowedException('Access denied');

// Worker processor
export class VerificationProcessor extends BaseProcessor<VerificationJobData> {
	constructor(
		@Inject(WINSTON_MODULE_PROVIDER) logger: Logger,
		private readonly prisma: PrismaService,
	) {
		super(logger);
	}

	async execute(job: Job<VerificationJobData>): Promise<void> {
		// throw AppNotFoundException → UnrecoverableError (no retry)
		// throw Error / AppInternalServerError → BullMQ retries
	}
}
```

---

## Environment Variables

| Biến                          | Giá trị           | Hành vi                                                                    |
| ----------------------------- | ----------------- | -------------------------------------------------------------------------- |
| `ENABLE_VERBOSE_ERR_RESPONSE` | `true`            | 500 errors trả thêm `data: stackTrace` — dùng cho dev                      |
| `ENABLE_VERBOSE_ERR_RESPONSE` | `false` (default) | 500 errors chỉ trả `{ statusCode: 500, message: "Internal Server Error" }` |
| `NODE_ENV`                    | `production`      | Winston dùng JSON format                                                   |
| `NODE_ENV`                    | anything else     | Winston dùng colorized simple format                                       |

---

## Checklist

- [ ] Cài `nest-winston` + `winston`
- [ ] Tạo `config/log.config.ts`
- [ ] Tạo `common/exceptions/exception.ts` với toàn bộ `App*Exception` classes
- [ ] Tạo `common/filters/exception.filter.ts` (`GlobalHandleExceptionFilter`)
- [ ] Xóa `common/filters/all-exceptions.filter.ts`
- [ ] Đăng ký `WinstonModule.forRootAsync` + `APP_FILTER` trong `AppModule`
- [ ] Xóa `app.useGlobalFilters(new AppExceptionsFilter())` khỏi `main.ts`
- [ ] Thêm `exceptionFactory` vào `ValidationPipe` trong `main.ts`
- [ ] Tạo `queue/base.processor.ts` (`BaseProcessor`)
- [ ] Trong service code: chỉ throw `App*Exception`, không throw `HttpException` trực tiếp
- [ ] Set `ENABLE_VERBOSE_ERR_RESPONSE=true` trong `.env.development`

## Pending

- [ ] Frontend error handling — cách web client xử lý `{ statusCode, message, data? }` response
