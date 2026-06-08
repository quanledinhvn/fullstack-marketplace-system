# 0005 — Seller UI — upload form + document list

**Label:** ready-for-agent
**Type:** AFK
**Blocked by:** #0002, #0004b

**Ref (Web):** `@docs/web-impl-structure.md`
**Prototype:** `docs/prototypes/seller.html`

## What to build

Seller-facing React views under `/_seller/*` route group. Follow `docs/web-impl-structure.md` conventions.

**Routes:**

- `/seller/documents` — document list page (default after login)
- Upload accessible from the list page (button → dialog)

**Document list:**

- Table: filename, file size, status (`StatusBadge` from `components/shared/status-badge.tsx`), uploaded date
- Status values shown to seller: pending, processing, verified, rejected, inconclusive
- `error` is an internal system status — do NOT display to seller (show as "Processing")

**Upload form:**

- File picker (accept: pdf, jpg, png; max 10MB client-side validation)
- Sends `{ fileName, fileSize, mimeType }` as JSON body to `POST /documents`
- On submit: show loading state
- On success: refresh document list
- On error: show error message (no internal details leaked)

**Follow web-impl-structure.md:**

- `modules/documents/` slice: `api/`, `hooks/`, `components/`, `schemas/`
- `useDocuments` hook: `useState<Document[]>` + fetch on mount + manual `refresh()`
- `useUploadDocument` hook: calls `uploadDocument()`, refreshes list on success

## Acceptance criteria

- [x] Seller can log in and land on `/seller/documents`
- [x] Document list shows all own documents with correct status
- [x] Upload form validates file type and size client-side
- [x] After upload, new document appears in list with `status = pending`
- [x] Documents with internal `error` status are not shown with "Error" label to seller
- [x] Admin cannot access `/seller/*` routes (redirected to login)
