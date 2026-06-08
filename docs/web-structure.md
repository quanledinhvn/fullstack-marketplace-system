# Web Structure — apps/web

Stack: React + Vite + TanStack Router + TanStack Query + shadcn/ui (light mode only) + Zustand + Zod + Playwright

---

## Folder Structure

```
apps/web/
├── public/
│   └── favicon.ico
│
├── src/
│   ├── main.tsx                        # Entry point, React root
│   ├── app.tsx                         # App shell: providers, router
│   ├── vite-env.d.ts
│   ├── styles.css                      # Tailwind directives, CSS variables (light only)
│   │
│   ├── config/                         # App-level configuration
│   │   ├── env.ts                      # Zod-validated import.meta.env
│   │   ├── query-client.ts             # TanStack Query client config
│   │   └── router.ts                   # TanStack Router instance
│   │
│   ├── lib/                            # Low-level, framework-agnostic utilities
│   │   ├── api.ts                      # Axios instance + request/response interceptors
│   │   ├── utils.ts                    # cn(), formatDate(), formatCurrency(), etc.
│   │   └── errors.ts                   # API error types & parsers
│   │
│   ├── hooks/                          # Shared custom hooks (non-feature)
│   │   ├── use-debounce.ts
│   │   └── use-media-query.ts
│   │
│   ├── components/                     # Reusable UI components
│   │   ├── ui/                         # shadcn/ui components (auto-generated, do not edit)
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   └── shared/                     # Custom composite components (cross-module)
│   │       ├── data-table/
│   │       │   ├── data-table.tsx
│   │       │   ├── data-table-toolbar.tsx
│   │       │   └── index.ts
│   │       ├── page-header.tsx
│   │       ├── error-boundary.tsx
│   │       └── loading-spinner.tsx
│   │
│   ├── layouts/                        # Route layout wrappers
│   │   ├── root-layout.tsx             # HTML shell, Toaster, global modals
│   │   ├── auth-layout.tsx             # Centered layout for login/register
│   │   └── dashboard-layout.tsx        # Sidebar + topbar shell
│   │
│   ├── modules/                        # Feature slices (mirrors API modules)
│   │   ├── auth/
│   │   │   ├── api/
│   │   │   │   ├── auth.api.ts         # Raw fetch functions (login, register, logout)
│   │   │   │   └── auth.keys.ts        # Query key factory
│   │   │   ├── hooks/
│   │   │   │   ├── use-login.ts        # useMutation wrapper
│   │   │   │   └── use-session.ts      # useQuery wrapper
│   │   │   ├── components/
│   │   │   │   ├── login-form.tsx
│   │   │   │   └── register-form.tsx
│   │   │   ├── stores/
│   │   │   │   └── auth.store.ts       # Zustand: session token, user info
│   │   │   ├── schemas/
│   │   │   │   └── auth.schema.ts      # Zod schemas for login/register forms
│   │   │   └── index.ts
│   │   │
│   │   ├── users/
│   │   │   ├── api/
│   │   │   │   ├── users.api.ts
│   │   │   │   └── users.keys.ts
│   │   │   ├── hooks/
│   │   │   │   ├── use-users.ts        # list with pagination/filter
│   │   │   │   └── use-user.ts         # single user by id
│   │   │   ├── components/
│   │   │   │   ├── users-table.tsx
│   │   │   │   └── user-form.tsx
│   │   │   ├── schemas/
│   │   │   │   └── user.schema.ts
│   │   │   └── index.ts
│   │   │
│   │   └── notifications/
│   │       ├── api/
│   │       │   ├── notifications.api.ts
│   │       │   └── notifications.keys.ts
│   │       ├── hooks/
│   │       │   └── use-notifications.ts
│   │       ├── components/
│   │       │   └── notification-bell.tsx
│   │       └── index.ts
│   │
│   ├── routes/                         # TanStack Router file-based routes
│   │   ├── __root.tsx                  # Root route (mounts root-layout)
│   │   ├── index.tsx                   # / → redirect to /dashboard
│   │   ├── _auth/                      # Auth group (auth-layout, public)
│   │   │   ├── route.tsx
│   │   │   ├── login.tsx               # /login
│   │   │   └── register.tsx            # /register
│   │   └── _dashboard/                 # Protected group (dashboard-layout)
│   │       ├── route.tsx               # beforeLoad: auth guard
│   │       ├── index.tsx               # /dashboard
│   │       └── users/
│   │           ├── index.tsx           # /users (list)
│   │           └── $userId.tsx         # /users/:userId (detail)
│   │
│   └── types/                          # Global TypeScript types
│       ├── api.types.ts                # ApiResponse<T>, Pagination, ErrorResponse
│       └── env.d.ts
│
├── e2e/                                # Playwright E2E tests
│   ├── fixtures/
│   │   ├── auth.fixture.ts             # Authenticated page fixture
│   │   └── index.ts
│   ├── pages/                          # Page Object Models
│   │   ├── login.page.ts
│   │   └── users.page.ts
│   ├── tests/
│   │   ├── auth.spec.ts
│   │   └── users.spec.ts
│   └── playwright.config.ts
│
├── components.json                     # shadcn/ui config (tailwind.config is empty for v4)
├── index.html
├── vite.config.ts                      # uses @tailwindcss/vite plugin, no tailwind.config.js needed
├── package.json
└── tsconfig.json
```

---

## Layer Responsibilities

| Layer                     | File                         | Responsibility                                                               |
| ------------------------- | ---------------------------- | ---------------------------------------------------------------------------- |
| **routes/**               | `routes/*.tsx`               | File-based routing (TanStack Router), consumes hooks/components from modules |
| **layouts/**              | `layouts/*.tsx`              | UI wrappers for route groups, no business logic                              |
| **modules/\*/api**        | `modules/*/api/*.ts`         | Raw API calls + query key factories                                          |
| **modules/\*/hooks**      | `modules/*/hooks/*.ts`       | `useQuery` / `useMutation` wrappers — data fetching layer                    |
| **modules/\*/components** | `modules/*/components/*.tsx` | Feature-specific components, scoped to their module                          |
| **modules/\*/stores**     | `modules/*/stores/*.ts`      | Zustand slices for client-only state (not server state)                      |
| **modules/\*/schemas**    | `modules/*/schemas/*.ts`     | Zod schemas for form validation (react-hook-form)                            |
| **components/ui**         | `components/ui/`             | shadcn auto-generated — do not edit directly                                 |
| **components/shared**     | `components/shared/`         | Custom composites reused across modules                                      |
| **lib/**                  | `lib/*.ts`                   | Pure utilities, no React or feature dependencies                             |
| **e2e/pages**             | `e2e/pages/*.ts`             | Page Object Models for Playwright                                            |

---

## Key Conventions

### Query key factory

Each module exports a `keys` object to avoid hardcoded strings:

```ts
// modules/users/api/users.keys.ts
export const usersKeys = {
	all: ['users'] as const,
	list: (params: UserQuery) => [...usersKeys.all, 'list', params] as const,
	detail: (id: string) => [...usersKeys.all, 'detail', id] as const,
};
```

### Module barrel

Each module has an `index.ts` that only exports its public API:

```ts
// modules/users/index.ts
export { UsersTable } from './components/users-table';
export { useUsers } from './hooks/use-users';
export { useUser } from './hooks/use-user';
```

### Route loader + hook pattern

TanStack Router loader prefetches data; the component accesses it from cache via hook:

```ts
// routes/_dashboard/users/index.tsx
export const Route = createFileRoute('/_dashboard/users/')({
	loader: ({ context }) => context.queryClient.ensureQueryData(usersListOptions()),
	component: UsersPage,
});
```

### Auth guard

Use `beforeLoad` in the route group instead of a wrapper component:

```ts
// routes/_dashboard/route.tsx
export const Route = createFileRoute('/_dashboard')({
	beforeLoad: ({ context }) => {
		if (!context.auth.isAuthenticated) {
			throw redirect({ to: '/login' });
		}
	},
});
```

### Tailwind v4 — no `tailwind.config.js`

Tailwind v4 is configured entirely via the Vite plugin + CSS file, no separate config file:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [tailwindcss()],
});
```

### shadcn `components.json` — v4 standard

`tailwind.config` is left **empty** because v4 does not use a config file:

```json
{
	"$schema": "https://ui.shadcn.com/schema.json",
	"style": "new-york",
	"rsc": false,
	"tsx": true,
	"tailwind": {
		"config": "",
		"css": "src/styles.css",
		"baseColor": "neutral",
		"cssVariables": true,
		"prefix": ""
	},
	"aliases": {
		"components": "@/components",
		"utils": "@/lib/utils",
		"ui": "@/components/ui",
		"lib": "@/lib",
		"hooks": "@/hooks"
	},
	"iconLibrary": "lucide"
}
```

### shadcn — light mode only, CSS variables (v4 standard)

Tailwind v4 + shadcn uses `oklch()` instead of `hsl()`, `@theme inline` to map CSS vars to Tailwind tokens,
and `@import "tailwindcss"` instead of `@tailwind` directives. Drop the `.dark {}` block entirely:

```css
/* src/styles.css */
@import 'tailwindcss';

@theme inline {
	--color-background: var(--background);
	--color-foreground: var(--foreground);
	--color-primary: var(--primary);
	--color-primary-foreground: var(--primary-foreground);
	--color-secondary: var(--secondary);
	--color-secondary-foreground: var(--secondary-foreground);
	--color-muted: var(--muted);
	--color-muted-foreground: var(--muted-foreground);
	--color-accent: var(--accent);
	--color-accent-foreground: var(--accent-foreground);
	--color-destructive: var(--destructive);
	--color-border: var(--border);
	--color-input: var(--input);
	--color-ring: var(--ring);
	--radius-sm: calc(var(--radius) * 0.6);
	--radius-md: calc(var(--radius) * 0.8);
	--radius-lg: var(--radius);
	--radius-xl: calc(var(--radius) * 1.4);
}

:root {
	--radius: 0.625rem;
	--background: oklch(1 0 0);
	--foreground: oklch(0.145 0 0);
	--primary: oklch(0.205 0 0);
	--primary-foreground: oklch(0.985 0 0);
	--secondary: oklch(0.97 0 0);
	--secondary-foreground: oklch(0.205 0 0);
	--muted: oklch(0.97 0 0);
	--muted-foreground: oklch(0.556 0 0);
	--accent: oklch(0.97 0 0);
	--accent-foreground: oklch(0.205 0 0);
	--destructive: oklch(0.577 0.245 27.325);
	--border: oklch(0.922 0 0);
	--input: oklch(0.922 0 0);
	--ring: oklch(0.708 0 0);
}
/* No .dark {} block */

@layer base {
	* {
		@apply border-border outline-ring/50;
	}
	body {
		@apply bg-background text-foreground;
	}
}
```

### Playwright Page Object Model

```ts
// e2e/pages/login.page.ts
export class LoginPage {
	constructor(private page: Page) {}

	async goto() {
		await this.page.goto('/login');
	}
	async login(email: string, password: string) {
		await this.page.fill('[name=email]', email);
		await this.page.fill('[name=password]', password);
		await this.page.click('[type=submit]');
	}
}
```
