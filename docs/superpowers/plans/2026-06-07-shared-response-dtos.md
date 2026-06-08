# Shared Response DTOs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Define response types in `packages/shared` with `T` prefix, implement `class-transformer`-decorated DTO classes in `apps/api`, and update all controllers to use `plainToInstance` + `ApiResponse<T>` envelope.

**Architecture:** `packages/shared` stays type-only (interfaces with `T` prefix) — no runtime dependencies. Each NestJS controller calls `plainToInstance(XxxResponseDto, data, { excludeExtraneousValues: true })` and wraps in `{ success: true, data: ... }`. Frontend API files switch from locally-defined types to the shared `T`-prefixed interfaces.

**Tech Stack:** `class-transformer` (already in `apps/api`), `packages/shared` (TypeScript interface-only), NestJS controllers.

---

## File Map

**Modify:**

- `packages/shared/src/index.ts` — replace `Document`, `User`, `AuditLog`, `ApiInfo`, `HealthResponse`, `GreetingRequest`, `GreetingResponse` with `TDocumentResponse`, `TAdminDocumentResponse`, `TAuthResponse`, `TPaginatedResponse<T>`, keep `TApiResponse<T>`, `DocumentStatus`
- `apps/api/src/modules/documents/documents.controller.ts` — add `plainToInstance` + `TApiResponse` wrapping
- `apps/api/src/modules/admin-document/admin.controller.ts` — same
- `apps/api/src/modules/auth/auth.controller.ts` — same
- `apps/web/src/modules/documents/api/documents.api.ts` — use `TDocumentResponse` from shared
- `apps/web/src/modules/auth/api/auth.api.ts` — use `TAuthResponse` from shared
- `apps/web/src/modules/documents/hooks/use-documents.ts` — use `TDocumentResponse`

**Create:**

- `apps/api/src/modules/documents/dto/document-response.dto.ts`
- `apps/api/src/modules/admin-document/dto/admin-document-response.dto.ts`
- `apps/api/src/modules/auth/dto/auth-response.dto.ts`

---

## Task 1: Refactor `packages/shared` types

**Files:**

- Modify: `packages/shared/src/index.ts`

- [ ] **Step 1: Replace shared index.ts with new T-prefixed interfaces**

Replace the entire content of `packages/shared/src/index.ts` with:

```ts
export enum DocumentStatus {
	PROCESSING = 'PROCESSING',
	VERIFIED = 'VERIFIED',
	REJECTED = 'REJECTED',
	INCONCLUSIVE = 'INCONCLUSIVE',
	ERROR = 'ERROR',
}

export type TApiResponse<T> = { success: true; data: T } | { success: false; error: string };

export interface TPaginatedResponse<T> {
	items: T[];
	total: number;
	page: number;
	pageSize: number;
	pages: number;
}

export interface TDocumentResponse {
	id: string;
	userId: string;
	fileName: string;
	fileSize: number;
	status: DocumentStatus;
	verificationId: string | null;
	jobId: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface TAdminDocumentResponse extends TDocumentResponse {
	sellerEmail: string;
}

export interface TAuthResponse {
	userId: string;
	role: 'seller' | 'admin';
	name: string;
	email: string;
}
```

- [ ] **Step 2: Build shared to verify no type errors**

```bash
cd packages/shared && pnpm build
```

Expected: exits with code 0, `dist/` updated.

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/index.ts
git commit -m "refactor(shared): replace interfaces with T-prefixed response types"
```

---

## Task 2: Create `DocumentResponseDto` in API

**Files:**

- Create: `apps/api/src/modules/documents/dto/document-response.dto.ts`

- [ ] **Step 1: Create the DTO class**

Create `apps/api/src/modules/documents/dto/document-response.dto.ts`:

```ts
import { Expose } from 'class-transformer';
import type { TDocumentResponse } from '@app/shared';
import { DocumentStatus } from '@app/shared';

export class DocumentResponseDto implements TDocumentResponse {
	@Expose() id: string;
	@Expose() userId: string;
	@Expose() fileName: string;
	@Expose() fileSize: number;
	@Expose() status: DocumentStatus;
	@Expose() verificationId: string | null;
	@Expose() jobId: string | null;
	@Expose() createdAt: Date;
	@Expose() updatedAt: Date;
}
```

- [ ] **Step 2: Typecheck**

```bash
cd apps/api && pnpm typecheck
```

Expected: exits with code 0.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/modules/documents/dto/document-response.dto.ts
git commit -m "feat(api): add DocumentResponseDto with @Expose decorators"
```

---

## Task 3: Create `AdminDocumentResponseDto` in API

**Files:**

- Create: `apps/api/src/modules/admin-document/dto/admin-document-response.dto.ts`

- [ ] **Step 1: Create the DTO class**

Create `apps/api/src/modules/admin-document/dto/admin-document-response.dto.ts`:

```ts
import { Expose } from 'class-transformer';
import type { TAdminDocumentResponse } from '@app/shared';
import { DocumentStatus } from '@app/shared';

export class AdminDocumentResponseDto implements TAdminDocumentResponse {
	@Expose() id: string;
	@Expose() userId: string;
	@Expose() fileName: string;
	@Expose() fileSize: number;
	@Expose() status: DocumentStatus;
	@Expose() verificationId: string | null;
	@Expose() jobId: string | null;
	@Expose() createdAt: Date;
	@Expose() updatedAt: Date;
	@Expose() sellerEmail: string;
}
```

- [ ] **Step 2: Typecheck**

```bash
cd apps/api && pnpm typecheck
```

Expected: exits with code 0.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/modules/admin-document/dto/admin-document-response.dto.ts
git commit -m "feat(api): add AdminDocumentResponseDto with @Expose decorators"
```

---

## Task 4: Create `AuthResponseDto` in API

**Files:**

- Create: `apps/api/src/modules/auth/dto/auth-response.dto.ts`

- [ ] **Step 1: Create the DTO class**

Create `apps/api/src/modules/auth/dto/auth-response.dto.ts`:

```ts
import { Expose } from 'class-transformer';
import type { TAuthResponse } from '@app/shared';

export class AuthResponseDto implements TAuthResponse {
	@Expose() userId: string;
	@Expose() role: 'seller' | 'admin';
	@Expose() name: string;
	@Expose() email: string;
}
```

- [ ] **Step 2: Typecheck**

```bash
cd apps/api && pnpm typecheck
```

Expected: exits with code 0.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/modules/auth/dto/auth-response.dto.ts
git commit -m "feat(api): add AuthResponseDto with @Expose decorators"
```

---

## Task 5: Update `DocumentsController` to serialize responses

**Files:**

- Modify: `apps/api/src/modules/documents/documents.controller.ts`

- [ ] **Step 1: Update the controller**

Replace `apps/api/src/modules/documents/documents.controller.ts`:

```ts
import { Body, Controller, Get, Logger, Param, Post, Query } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import type { User } from '@prisma/client';
import type { TApiResponse, TDocumentResponse } from '@app/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { DocumentsService } from './documents.service';
import { DocumentQueryDto } from './dto/document-query.dto';
import { DocumentResponseDto } from './dto/document-response.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';

@Controller('documents')
@Roles('seller')
export class DocumentsController {
	private readonly logger = new Logger(DocumentsController.name);

	constructor(private readonly documentsService: DocumentsService) {}

	@Post()
	async upload(
		@CurrentUser() user: User,
		@Body() dto: UploadDocumentDto,
	): Promise<TApiResponse<TDocumentResponse>> {
		this.logger.log(`[POST /documents] userId=${user.id} fileName=${dto.fileName}`);
		const doc = await this.documentsService.upload(user.id, dto);
		return {
			success: true,
			data: plainToInstance(DocumentResponseDto, doc, { excludeExtraneousValues: true }),
		};
	}

	@Get()
	async list(
		@CurrentUser() user: User,
		@Query() query: DocumentQueryDto,
	): Promise<TApiResponse<TDocumentResponse[]>> {
		this.logger.log(`[GET /documents] userId=${user.id} query=${JSON.stringify(query)}`);
		const docs = await this.documentsService.list(user.id, query);
		return {
			success: true,
			data: docs.map((doc) =>
				plainToInstance(DocumentResponseDto, doc, { excludeExtraneousValues: true }),
			),
		};
	}

	@Get(':id')
	async findOne(
		@CurrentUser() user: User,
		@Param('id') id: string,
	): Promise<TApiResponse<TDocumentResponse>> {
		this.logger.log(`[GET /documents/:id] userId=${user.id} documentId=${id}`);
		const doc = await this.documentsService.findOne(user.id, id);
		return {
			success: true,
			data: plainToInstance(DocumentResponseDto, doc, { excludeExtraneousValues: true }),
		};
	}
}
```

- [ ] **Step 2: Typecheck**

```bash
cd apps/api && pnpm typecheck
```

Expected: exits with code 0.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/modules/documents/documents.controller.ts
git commit -m "feat(api): serialize document responses with plainToInstance"
```

---

## Task 6: Update `AdminController` to serialize responses

**Files:**

- Modify: `apps/api/src/modules/admin-document/admin.controller.ts`

- [ ] **Step 1: Update the controller**

Replace `apps/api/src/modules/admin-document/admin.controller.ts`:

```ts
import { Controller, Get, Query } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import type { TAdminDocumentResponse, TApiResponse } from '@app/shared';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { AdminDocumentResponseDto } from './dto/admin-document-response.dto';
import { AdminDocumentQueryDto } from './dto/admin-document-query.dto';

@Controller('admin/documents')
@Roles('admin')
export class AdminController {
	constructor(private readonly adminService: AdminService) {}

	@Get()
	async listAll(
		@Query() query: AdminDocumentQueryDto,
	): Promise<TApiResponse<TAdminDocumentResponse[]>> {
		const docs = await this.adminService.listAll(query);
		return {
			success: true,
			data: docs.map((doc) =>
				plainToInstance(AdminDocumentResponseDto, doc, { excludeExtraneousValues: true }),
			),
		};
	}
}
```

- [ ] **Step 2: Typecheck**

```bash
cd apps/api && pnpm typecheck
```

Expected: exits with code 0.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/modules/admin-document/admin.controller.ts
git commit -m "feat(api): serialize admin document responses with plainToInstance"
```

---

## Task 7: Update `AuthController` to serialize responses

**Files:**

- Modify: `apps/api/src/modules/auth/auth.controller.ts`

- [ ] **Step 1: Update the controller**

Replace `apps/api/src/modules/auth/auth.controller.ts`:

```ts
import { Body, Controller, Post } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import type { TApiResponse, TAuthResponse } from '@app/shared';
import { Public } from '../../common/decorators';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post('login')
	@Public()
	async login(@Body() loginDto: LoginDto): Promise<TApiResponse<TAuthResponse>> {
		const result = await this.authService.validateUser(loginDto);
		return {
			success: true,
			data: plainToInstance(AuthResponseDto, result, { excludeExtraneousValues: true }),
		};
	}
}
```

- [ ] **Step 2: Typecheck**

```bash
cd apps/api && pnpm typecheck
```

Expected: exits with code 0.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/modules/auth/auth.controller.ts
git commit -m "feat(api): serialize auth response with plainToInstance"
```

---

## Task 8: Update frontend API files to use shared types

**Files:**

- Modify: `apps/web/src/modules/documents/api/documents.api.ts`
- Modify: `apps/web/src/modules/auth/api/auth.api.ts`
- Modify: `apps/web/src/modules/documents/hooks/use-documents.ts`

- [ ] **Step 1: Update `documents.api.ts`**

Replace `apps/web/src/modules/documents/api/documents.api.ts`:

```ts
import type { TApiResponse, TDocumentResponse } from '@app/shared';
import { api } from '@/lib/api';

export interface UploadDocumentBody {
	fileName: string;
	fileSize: number;
	mimeType: string;
}

export async function listDocuments(): Promise<TDocumentResponse[]> {
	const res = await api.get<TApiResponse<TDocumentResponse[]>>('/documents');
	if (!res.success) throw new Error(res.error);
	return res.data;
}

export async function uploadDocument(body: UploadDocumentBody): Promise<TDocumentResponse> {
	const res = await api.post<TApiResponse<TDocumentResponse>>('/documents', body);
	if (!res.success) throw new Error(res.error);
	return res.data;
}
```

- [ ] **Step 2: Update `auth.api.ts`**

Replace `apps/web/src/modules/auth/api/auth.api.ts`:

```ts
import type { TApiResponse, TAuthResponse } from '@app/shared';
import { api } from '../../../lib/api';

export interface LoginRequest {
	email: string;
	password: string;
}

export const authApi = {
	login: async (credentials: LoginRequest): Promise<TAuthResponse> => {
		const res = await api.post<TApiResponse<TAuthResponse>>('/auth/login', credentials);
		if (!res.success) throw new Error(res.error);
		return res.data;
	},
};
```

- [ ] **Step 3: Update `use-documents.ts`**

Replace `apps/web/src/modules/documents/hooks/use-documents.ts`:

```ts
import type { TDocumentResponse } from '@app/shared';
import { useCallback, useEffect, useState } from 'react';
import { listDocuments } from '../api/documents.api';

export function useDocuments() {
	const [documents, setDocuments] = useState<TDocumentResponse[]>([]);
	const [loading, setLoading] = useState(false);

	const fetch = useCallback(async () => {
		setLoading(true);
		try {
			const docs = await listDocuments();
			setDocuments(docs);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		let cancelled = false;
		listDocuments().then((docs) => {
			if (!cancelled) setDocuments(docs);
		});
		return () => {
			cancelled = true;
		};
	}, []);

	return { documents, loading, refresh: fetch };
}
```

- [ ] **Step 4: Typecheck web**

```bash
cd apps/web && pnpm typecheck
```

Expected: exits with code 0.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/modules/documents/api/documents.api.ts \
        apps/web/src/modules/auth/api/auth.api.ts \
        apps/web/src/modules/documents/hooks/use-documents.ts
git commit -m "feat(web): use shared T-prefixed response types in API clients"
```

---

## Task 9: Final typecheck across monorepo

- [ ] **Step 1: Run full monorepo typecheck**

```bash
pnpm --filter @app/shared build && pnpm --filter @app/api typecheck && pnpm --filter @app/web typecheck
```

Expected: all three exit with code 0.

- [ ] **Step 2: Verify `api.interceptors.response` still unwraps correctly**

The axios interceptor in `apps/web/src/lib/api.ts` returns `response.data` — which is now `TApiResponse<T>`. The API functions in Task 8 explicitly destructure `.data` from the envelope, so the chain is correct. No change needed to `api.ts`.

- [ ] **Step 3: Final commit if any loose ends**

```bash
git add -p
git commit -m "chore: final typecheck cleanup for shared response DTOs"
```
