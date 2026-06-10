Status: ready-for-agent

# 04 — Seller documents page

## What to build

Migrate the Seller documents page to Tailwind + shadcn. Replace the custom table, status badges, and upload dialog with shadcn equivalents.

- Install shadcn components: `table`, `badge`, `dialog`, `button`, `input`
- Rewrite `DocumentsTable` using shadcn `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` — columns: name, size, status, upload date
- Status column uses shadcn `Badge` — map each Document status to an appropriate badge variant (use `default`/`secondary`/`destructive`/`outline` as appropriate)
- Rewrite `UploadDocumentDialog` using shadcn `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `Button`, and a plain shadcn-styled `Input type="file"` (no drag-and-drop, no dropzone library)
- Rewrite `SellerDocumentsPage` layout using Tailwind classes
- Update all related component and hook tests

## Acceptance criteria

- [ ] `/seller/documents` renders the documents table with correct columns
- [ ] Each status value displays as a shadcn `Badge`
- [ ] "Upload" button opens the shadcn `Dialog`
- [ ] File input inside dialog accepts `.pdf`, `.jpg`, `.jpeg`, `.png` and triggers upload on confirm
- [ ] All existing seller documents tests pass (updated selectors as needed)

## Blocked by

- `01-foundation.md`
- `03-dashboard-layout.md`
