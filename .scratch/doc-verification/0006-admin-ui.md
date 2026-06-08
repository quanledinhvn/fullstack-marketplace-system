# 0006 — Admin UI — document list + filter by status

**Label:** ready-for-agent
**Type:** AFK
**Blocked by:** #0002, #0004b

**Ref (Web):** `@docs/web-impl-structure.md`
**Prototype:** `docs/prototypes/admin.html`

## What to build

Admin-facing React views under `/_admin/*` route group. Follow `docs/web-impl-structure.md` conventions.

**Routes:**

- `/admin/documents` — all documents list (default after admin login)

**Document list:**

- Table: seller email, filename, status (`StatusBadge` from `components/shared/status-badge.tsx`), uploaded date
- Filter by status via `?status=` query param (Select dropdown)
- Shows all sellers' documents (not scoped to current user)

**Follow web-impl-structure.md:**

- `modules/admin/` slice: `api/`, `hooks/`, `components/`
- `useAdminDocuments(status?)` hook: `useState<Document[]>` + `useEffect` re-fetch when status filter changes
- `Route.useSearch()` reads `?status=` from URL

## Acceptance criteria

- [x] Admin can log in and land on `/admin/documents`
- [x] Document list shows all documents across all sellers
- [x] Filter by status works (e.g. `?status=inconclusive` shows only inconclusive documents)
- [x] `StatusBadge` renders correct color for each status
- [x] Seller cannot access `/admin/*` routes (redirected to login)
