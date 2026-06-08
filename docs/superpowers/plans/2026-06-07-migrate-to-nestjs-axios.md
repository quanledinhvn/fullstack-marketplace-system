# Migrate HTTP Client to @nestjs/axios Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the custom `httpClientProvider` / `HTTP_CLIENT` token with `@nestjs/axios` `HttpService` in `VerificationService`.

**Architecture:** Install `@nestjs/axios` + `axios`, import `HttpModule` into `VerificationModule`, inject `HttpService` directly into `VerificationService`, and convert RxJS Observable responses to Promises via `lastValueFrom`. Remove the now-unused custom provider file and update the service spec to mock `HttpService`.

**Tech Stack:** NestJS 11, `@nestjs/axios`, `axios`, `rxjs/lastValueFrom`

---

### Task 1: Install dependencies

**Files:**

- Modify: `apps/api/package.json`

- [ ] **Step 1: Install `@nestjs/axios` and `axios`**

Run from repo root:

```bash
pnpm --filter @app/api add @nestjs/axios axios
```

Expected output: packages added to `apps/api/package.json` dependencies.

- [ ] **Step 2: Verify installation**

```bash
grep -E '"@nestjs/axios"|"axios"' apps/api/package.json
```

Expected:

```
"@nestjs/axios": "^3.x.x",
"axios": "^1.x.x",
```

- [ ] **Step 3: Commit**

```bash
git add apps/api/package.json pnpm-lock.yaml
git commit -m "chore(api): install @nestjs/axios and axios"
```

---

### Task 2: Update VerificationService to use HttpService

**Files:**

- Modify: `apps/api/src/modules/verification/verification.service.ts`

- [ ] **Step 1: Write the failing typecheck**

```bash
cd apps/api && npx tsc -p tsconfig.json --noEmit 2>&1 | head -20
```

Expected: passes (baseline before change).

- [ ] **Step 2: Replace verification.service.ts**

Full file content:

```ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

export class RateLimitError extends Error {
	constructor() {
		super('RATE_LIMITED');
	}
}

export class ServiceError extends Error {
	constructor() {
		super('SERVICE_ERROR');
	}
}

@Injectable()
export class VerificationService {
	private readonly verifyUrl: string;
	private readonly callbackUrl: string;

	constructor(
		config: ConfigService,
		private readonly http: HttpService,
	) {
		const base = config.get<string>('VERIFICATION_SERVICE_URL', 'http://localhost:3001');
		const api = config.get<string>('API_URL', 'http://localhost:3000');
		this.verifyUrl = `${base}/verify`;
		this.callbackUrl = `${api}/internal/webhook`;
	}

	async callMockService(documentId: string): Promise<{ verificationId: string }> {
		const res = await lastValueFrom(
			this.http.post<{ verificationId: string }>(
				this.verifyUrl,
				{
					documentId,
					callbackUrl: this.callbackUrl,
				},
				{
					// Axios throws AxiosError for 4xx/5xx by default.
					// We handle status codes manually, so allow all statuses through.
					validateStatus: () => true,
				},
			),
		);

		if (res.status === 429) throw new RateLimitError();
		if (res.status >= 500) throw new ServiceError();

		return res.data;
	}
}
```

- [ ] **Step 3: Run typecheck**

```bash
cd apps/api && npx tsc -p tsconfig.json --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/modules/verification/verification.service.ts
git commit -m "feat(verification): migrate VerificationService to HttpService"
```

---

### Task 3: Update VerificationModule to use HttpModule

**Files:**

- Modify: `apps/api/src/modules/verification/verification.module.ts`
- Delete: `apps/api/src/common/providers/http-client.provider.ts`

- [ ] **Step 1: Replace verification.module.ts**

Full file content:

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../../database/prisma.module';
import { VERIFICATION_QUEUE } from '../../queue/queue.constants';
import { DocumentsModule } from '../documents/documents.module';
import { VerificationConsumer } from './verification.consumer';
import { VerificationService } from './verification.service';

@Module({
	imports: [
		ConfigModule,
		PrismaModule,
		DocumentsModule,
		HttpModule,
		BullModule.registerQueue({ name: VERIFICATION_QUEUE }),
	],
	providers: [VerificationService, VerificationConsumer],
	exports: [VerificationService],
})
export class VerificationModule {}
```

- [ ] **Step 2: Delete the custom provider file**

```bash
rm apps/api/src/common/providers/http-client.provider.ts
```

Check if the `common/providers/` directory is now empty; if so, remove it too:

```bash
ls apps/api/src/common/providers/ 2>/dev/null && echo "has files" || rmdir apps/api/src/common/providers/
```

- [ ] **Step 3: Run typecheck**

```bash
cd apps/api && npx tsc -p tsconfig.json --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/modules/verification/verification.module.ts
git rm apps/api/src/common/providers/http-client.provider.ts
git commit -m "feat(verification): replace httpClientProvider with HttpModule"
```

---

### Task 4: Update VerificationService spec

**Files:**

- Modify: `apps/api/src/modules/verification/verification.service.spec.ts`

The current spec injects `HTTP_CLIENT` with a manual mock. After migration, we inject `HttpService` and mock its `.post()` method which returns an Observable. We use `of()` from RxJS to create a mock Observable that resolves synchronously.

- [ ] **Step 1: Replace verification.service.spec.ts**

Full file content:

```ts
import { Test } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { VerificationService, RateLimitError, ServiceError } from './verification.service';

const mockPost = jest.fn();

describe('VerificationService', () => {
	let service: VerificationService;

	beforeEach(async () => {
		mockPost.mockReset();
		const module = await Test.createTestingModule({
			providers: [
				VerificationService,
				{
					provide: ConfigService,
					useValue: {
						get: (key: string, fallback?: string) => {
							if (key === 'VERIFICATION_SERVICE_URL') return 'http://mock-verify:3001';
							if (key === 'API_URL') return 'http://api:3000';
							return fallback;
						},
					},
				},
				{
					provide: HttpService,
					useValue: { post: mockPost },
				},
			],
		}).compile();
		service = module.get(VerificationService);
	});

	it('returns verificationId when mock service responds 202', async () => {
		const axiosResponse: AxiosResponse = {
			status: 202,
			data: { verificationId: 'vid-123' },
			statusText: 'Accepted',
			headers: {},
			config: {} as any,
		};
		mockPost.mockReturnValueOnce(of(axiosResponse));

		const result = await service.callMockService('doc-1');
		expect(result).toEqual({ verificationId: 'vid-123' });
		expect(mockPost).toHaveBeenCalledWith('http://mock-verify:3001/verify', {
			documentId: 'doc-1',
			callbackUrl: 'http://api:3000/internal/webhook',
		});
	});

	it('throws RateLimitError on 429', async () => {
		const axiosResponse: AxiosResponse = {
			status: 429,
			data: {},
			statusText: 'Too Many Requests',
			headers: {},
			config: {} as any,
		};
		mockPost.mockReturnValueOnce(of(axiosResponse));

		await expect(service.callMockService('doc-1')).rejects.toThrow(RateLimitError);
	});

	it('throws ServiceError on 5xx response', async () => {
		const axiosResponse: AxiosResponse = {
			status: 503,
			data: {},
			statusText: 'Service Unavailable',
			headers: {},
			config: {} as any,
		};
		mockPost.mockReturnValueOnce(of(axiosResponse));

		await expect(service.callMockService('doc-1')).rejects.toThrow(ServiceError);
	});
});
```

- [ ] **Step 2: Run the spec**

```bash
cd apps/api && npx jest verification.service.spec --no-coverage
```

Expected: 3 passing tests.

- [ ] **Step 3: Run full test suite to check for regressions**

```bash
cd apps/api && npx jest --no-coverage
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/modules/verification/verification.service.spec.ts
git commit -m "test(verification): update spec to mock HttpService instead of HTTP_CLIENT"
```

---

### Task 5: Remove jest-mock-axios devDependency (if unused elsewhere)

**Files:**

- Modify: `apps/api/package.json`

- [ ] **Step 1: Check if jest-mock-axios is used anywhere**

```bash
grep -r "jest-mock-axios" apps/api/src/ apps/api/test/ 2>/dev/null
```

Expected: no output (not used anymore).

- [ ] **Step 2: Remove if unused**

If the grep above returned nothing:

```bash
pnpm --filter @app/api remove jest-mock-axios
```

- [ ] **Step 3: Run full test suite one more time**

```bash
cd apps/api && npx jest --no-coverage
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add apps/api/package.json pnpm-lock.yaml
git commit -m "chore(api): remove unused jest-mock-axios devDependency"
```
