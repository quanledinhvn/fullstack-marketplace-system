Status: ready-for-agent

# 05 — Admin documents page

## What to build

Migrate the Admin documents page to Tailwind + shadcn. Replace the custom admin table and status filter dropdown with shadcn equivalents.

- Install shadcn components: `table`, `badge`, `select`, `button` (likely already installed by slice 04 — add only if missing)
- Rewrite `AdminDocumentsTable` using shadcn `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` — columns: name, seller email, size, status, upload date
- Status column uses shadcn `Badge` (same variant mapping as slice 04)
- Rewrite `StatusFilter` using shadcn `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` — options: All, PENDING, PROCESSING, VERIFIED, REJECTED, INCONCLUSIVE
- Rewrite `AdminDocumentsPage` layout using Tailwind classes
- Update all related component and hook tests

## Acceptance criteria

- [ ] `/admin/documents` renders the admin table with correct columns including seller email
- [ ] Each status value displays as a shadcn `Badge`
- [ ] `StatusFilter` renders as a shadcn `Select` and filters the table on change
- [ ] All existing admin documents tests pass (updated selectors as needed)

## Blocked by

- `01-foundation.md`
- `03-dashboard-layout.md`
