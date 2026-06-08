# 0004b — Document Upload API

**Label:** ready-for-agent
**Type:** AFK
**Blocked by:** #0002, #0004a

**Ref (API):** `@docs/api-impl-structure.md`

## What to build

Seller-facing document endpoints. File upload is stubbed — validate type/size, store metadata only, `file_url` is a fake string.

**Endpoints:**

- `POST /documents` (seller) — body `{ fileName, fileSize, mimeType }`, validate file type (pdf/jpg/png) + size (max 10MB). Creates document record with `status = pending`, `file_url = "stub://<filename>"`. Returns document.
- `GET /documents` (seller) — list own documents, ordered by `created_at DESC`. Pagination optional.
- `GET /documents/:id` (seller) — get single document. 403 if not owner.

**Follow `docs/api-impl-structure.md` conventions:**

- Controller → Service → Repository layers
- `RolesGuard` + `@Roles('seller')`
- `@CurrentUser()` decorator to get authenticated user
- `class-validator` + `class-transformer` via global `ValidationPipe`

## Acceptance criteria

- [x] `POST /documents` with valid file metadata returns 201 + document with `status = pending`
- [x] `POST /documents` with invalid file type returns 400
- [x] `POST /documents` with file > 10MB returns 400
- [x] `GET /documents` returns only the authenticated seller's documents
- [x] `GET /documents/:id` returns 403 if document belongs to another seller
- [x] Document record appears in DB with correct `user_id`, `status = pending`
- [x] A BullMQ job is enqueued after successful upload (job ID stored in `documents.job_id`)
