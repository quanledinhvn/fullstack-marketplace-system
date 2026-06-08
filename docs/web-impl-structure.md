# Web Implementation Structure — apps/web

Stack: React + Vite + TanStack Router + shadcn/ui + Zustand + Zod + Tailwind v4

---

## Auth Strategy (Web Side)

`POST /auth/login` trả về `{ userId, role, name, email }`.  
Zustand auth store lưu vào localStorage.  
`lib/api.ts` Axios instance tự gắn `Authorization: <userId>` vào mọi request qua interceptor.

---

## packages/types (`@app/types`)

```
packages/types/
├── src/
│   ├── document.ts         # Document interface, DocumentStatus enum
│   ├── user.ts             # User interface, UserRole enum
│   ├── audit-log.ts        # AuditLog interface
│   ├── api.ts              # ApiResponse<T>, PaginatedResponse<T>, ErrorResponse
│   └── index.ts            # barrel export
├── package.json            # name: "@app/types"
└── tsconfig.json
```

**Exports:**

```ts
// document.ts
export enum DocumentStatus {
	PENDING = 'pending',
	PROCESSING = 'processing',
	VERIFIED = 'verified',
	REJECTED = 'rejected',
	INCONCLUSIVE = 'inconclusive',
	ERROR = 'error',
}

export interface Document {
	id: string;
	userId: string;
	fileName: string;
	fileSize: number;
	status: DocumentStatus;
	createdAt: string;
	updatedAt: string;
}
```

---

## apps/web Folder Structure

```
apps/web/
├── public/
│   └── favicon.ico
│
├── src/
│   ├── main.tsx                            # React root, RouterProvider
│   ├── app.tsx                             # providers shell
│   ├── styles.css                          # Tailwind v4, light mode only
│   ├── vite-env.d.ts
│   │
│   ├── config/
│   │   ├── env.ts                          # Zod: validates VITE_API_URL at startup
│   │   └── router.ts                       # TanStack Router instance
│   │
│   ├── lib/
│   │   ├── api.ts                          # Axios instance
│   │   │                                   # interceptor: Authorization: <userId> from store
│   │   │                                   # interceptor: unwrap ApiResponse<T> → T
│   │   ├── utils.ts                        # cn(), formatDate(), formatFileSize()
│   │   └── errors.ts                       # parseApiError() → user-safe message
│   │
│   ├── components/
│   │   ├── ui/                             # shadcn/ui (do not edit)
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── table.tsx
│   │   │   ├── select.tsx
│   │   │   └── badge.tsx
│   │   └── shared/
│   │       ├── status-badge.tsx            # DocumentStatus → colored Badge (pending=gray, processing=blue, verified=green, rejected=red, inconclusive=yellow, error=orange)
│   │       ├── page-header.tsx             # title + optional action slot
│   │       ├── error-boundary.tsx
│   │       └── loading-spinner.tsx
│   │
│   ├── layouts/
│   │   ├── root-layout.tsx                 # HTML shell, Toaster
│   │   ├── auth-layout.tsx                 # centered card layout for login
│   │   └── dashboard-layout.tsx            # sidebar nav + topbar (logout button)
│   │
│   ├── modules/
│   │   │
│   │   ├── auth/
│   │   │   ├── api/
│   │   │   │   └── auth.api.ts             # login(email, password) → { userId, role, name, email }
│   │   │   ├── hooks/
│   │   │   │   └── use-login.ts            # useState loading/error; on success: setUser() + navigate by role
│   │   │   ├── components/
│   │   │   │   └── login-form.tsx          # react-hook-form + Zod schema
│   │   │   ├── stores/
│   │   │   │   └── auth.store.ts
│   │   │   │       # Zustand: { userId, role, name, email }
│   │   │   │       # persist to localStorage
│   │   │   │       # actions: setUser(), clearUser()
│   │   │   ├── schemas/
│   │   │   │   └── auth.schema.ts          # z.object({ email, password })
│   │   │   └── index.ts
│   │   │
│   │   ├── documents/                      # seller-facing
│   │   │   ├── api/
│   │   │   │   └── documents.api.ts
│   │   │   │       # listDocuments() → Document[]
│   │   │   │       # uploadDocument(body) → Document
│   │   │   ├── hooks/
│   │   │   │   ├── use-documents.ts
│   │   │   │   │   # useState<Document[]>; useEffect fetch on mount
│   │   │   │   │   # setInterval 5000ms poll if any doc is pending|processing
│   │   │   │   └── use-upload-document.ts
│   │   │   │       # useState loading/error; calls uploadDocument(); refresh list on success
│   │   │   ├── components/
│   │   │   │   ├── documents-table.tsx
│   │   │   │   │   # columns: fileName, fileSize, StatusBadge, createdAt
│   │   │   │   └── upload-document-dialog.tsx
│   │   │   │       # Dialog with file input
│   │   │   │       # client-side: accept pdf/jpg/png, max 10MB
│   │   │   │       # sends { fileName, fileSize, mimeType } as JSON (stub upload)
│   │   │   ├── schemas/
│   │   │   │   └── document.schema.ts      # Zod: file type + size validation
│   │   │   └── index.ts
│   │   │
│   │   └── admin/
│   │       ├── api/
│   │       │   └── admin.api.ts
│   │       │       # listAllDocuments(status?) → Document[]
│   │       ├── hooks/
│   │       │   └── use-admin-documents.ts
│   │       │       # useState<Document[]>; useEffect re-fetch when status filter changes
│   │       ├── components/
│   │       │   ├── admin-documents-table.tsx
│   │       │   │   # columns: sellerEmail, fileName, StatusBadge, createdAt
│   │       │   └── status-filter.tsx
│   │       │       # Select dropdown → updates ?status= query param
│   │       └── index.ts
│   │
│   ├── routes/
│   │   ├── __root.tsx                      # mounts root-layout, router context: { auth }
│   │   ├── index.tsx                       # / → redirect /seller/documents or /admin/documents by role
│   │   ├── _auth/
│   │   │   ├── route.tsx                   # auth-layout; beforeLoad: redirect if already logged in
│   │   │   └── login.tsx                   # /login — LoginForm
│   │   ├── _seller/
│   │   │   ├── route.tsx
│   │   │   │   # beforeLoad: if !user || role ≠ 'seller' → redirect /login
│   │   │   └── documents/
│   │   │       └── index.tsx
│   │   │           # /seller/documents
│   │   │           # component: DocumentsTable + UploadDocumentDialog
│   │   └── _admin/
│   │       ├── route.tsx
│   │       │   # beforeLoad: if !user || role ≠ 'admin' → redirect /login
│   │       └── documents/
│   │           └── index.tsx
│   │               # /admin/documents
│   │               # component: AdminDocumentsTable + StatusFilter
│   │
│   └── types/
│       ├── api.types.ts                    # re-export from @app/types if needed
│       └── env.d.ts                        # ImportMetaEnv: VITE_API_URL
│
├── components.json                         # shadcn/ui config (tailwind.config: "")
├── index.html
├── vite.config.ts                          # @tailwindcss/vite plugin
├── package.json                            # deps: @app/types (workspace:*)
└── tsconfig.json
```

---

## Layer Responsibilities

| Layer                     | File               | Responsibility                                               |
| ------------------------- | ------------------ | ------------------------------------------------------------ |
| **routes/**               | `routes/*.tsx`     | File-based routing, loader prefetch, auth guard              |
| **layouts/**              | `layouts/*.tsx`    | UI shell wrappers, no business logic                         |
| **modules/\*/api**        | `api/*.ts`         | Raw Axios calls                                              |
| **modules/\*/hooks**      | `hooks/*.ts`       | `useState` + `useEffect` data fetching                       |
| **modules/\*/components** | `components/*.tsx` | Feature UI components                                        |
| **modules/\*/stores**     | `stores/*.ts`      | Zustand: client-only state (auth session)                    |
| **modules/\*/schemas**    | `schemas/*.ts`     | Zod: form validation only                                    |
| **lib/api.ts**            | —                  | Axios instance + interceptors (auth header, response unwrap) |
| **components/shared/**    | `shared/*.tsx`     | StatusBadge + shared display components                      |
| **@app/types**            | packages/types     | Shared TS types (Document, User, DocumentStatus)             |

---

## Key Conventions

### Authorization header

```ts
// lib/api.ts
axiosInstance.interceptors.request.use((config) => {
	const userId = useAuthStore.getState().userId;
	if (userId) config.headers.Authorization = userId;
	return config;
});
```

### Status filter (admin)

```ts
// routes/_admin/documents/index.tsx
const { status } = Route.useSearch(); // ?status=inconclusive
const { docs, loading } = useAdminDocuments(status);
// useEffect re-runs when status changes
```

---

## Environment Variables (`apps/web/.env.example`)

```
VITE_API_URL=http://localhost:3000
```
