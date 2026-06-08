# TanStack Router Deprecation Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace deprecated `new RootRoute()`, `new Route()`, and `new Router()` constructor patterns with the current `createRootRoute()`, `createRoute()`, and `createRouter()` function equivalents in the frontend router config.

**Architecture:** Single-file change to `apps/web/src/config/router.tsx`. The `adminDocumentsRoute` component's self-referential `.useSearch()` / `.useNavigate()` calls are replaced with `getRouteApi('/admin/documents')` to decouple hook usage from route definition. No behavior changes — purely a constructor-to-function migration.

**Tech Stack:** `@tanstack/react-router@^1.85.6`, React, TypeScript

---

### Task 1: Replace deprecated constructors and migrate to `getRouteApi`

**Files:**

- Modify: `apps/web/src/config/router.tsx`

- [ ] **Step 1: Verify the TypeScript error exists**

Run:

```bash
cd apps/web && npx tsc --noEmit 2>&1 | grep -i deprecated
```

Expected output includes something like:

```
src/config/router.tsx:10:22 - error TS2673: Constructor of class 'RootRoute' is deprecated
```

- [ ] **Step 2: Replace the file contents**

Replace `apps/web/src/config/router.tsx` with:

```tsx
import {
	createRootRoute,
	createRoute,
	createRouter,
	getRouteApi,
	redirect,
} from '@tanstack/react-router';
import { AuthLayout } from '../layouts/auth-layout';
import { DashboardLayout } from '../layouts/dashboard-layout';
import { RootLayout } from '../layouts/root-layout';
import { LoginForm } from '../modules/auth/components/login-form';
import { useAuthStore } from '../modules/auth/stores/auth.store';
import { AdminDocumentsPage } from '../modules/admin/components/admin-documents-page';
import { SellerDocumentsPage } from '../modules/documents/components/seller-documents-page';

const rootRoute = createRootRoute({
	component: RootLayout,
});

const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/',
	beforeLoad: async () => {
		const user = useAuthStore.getState().user;
		if (!user) {
			return redirect({ to: '/login' });
		}
		if (user.role === 'seller') {
			return redirect({ to: '/seller/documents' });
		} else if (user.role === 'admin') {
			return redirect({ to: '/admin/documents' });
		}
	},
	component: () => null,
});

const authRoute = createRoute({
	getParentRoute: () => rootRoute,
	id: '_auth',
	component: AuthLayout,
	beforeLoad: async () => {
		const user = useAuthStore.getState().user;
		if (user) {
			if (user.role === 'seller') {
				return redirect({ to: '/seller/documents' });
			} else if (user.role === 'admin') {
				return redirect({ to: '/admin/documents' });
			}
		}
	},
});

const loginRoute = createRoute({
	getParentRoute: () => authRoute,
	path: '/login',
	component: LoginForm,
});

const sellerRoute = createRoute({
	getParentRoute: () => rootRoute,
	id: '_seller',
	component: DashboardLayout,
	beforeLoad: async () => {
		const user = useAuthStore.getState().user;
		if (!user || user.role !== 'seller') {
			return redirect({ to: '/login' });
		}
	},
});

const sellerDocumentsRoute = createRoute({
	getParentRoute: () => sellerRoute,
	path: '/seller/documents',
	component: SellerDocumentsPage,
});

const adminRoute = createRoute({
	getParentRoute: () => rootRoute,
	id: '_admin',
	component: DashboardLayout,
	beforeLoad: async () => {
		const user = useAuthStore.getState().user;
		if (!user || user.role !== 'admin') {
			return redirect({ to: '/login' });
		}
	},
});

const adminRouteApi = getRouteApi('/admin/documents');

const adminDocumentsRoute = createRoute({
	getParentRoute: () => adminRoute,
	path: '/admin/documents',
	validateSearch: (search: Record<string, unknown>) => ({
		status: typeof search.status === 'string' ? search.status : undefined,
	}),
	component: function AdminDocumentsRoute() {
		const { status } = adminRouteApi.useSearch();
		const navigate = adminRouteApi.useNavigate();
		const handleStatusChange = (s: string) => {
			navigate({ search: (prev) => ({ ...prev, status: s || undefined }) });
		};
		return <AdminDocumentsPage status={status} onStatusChange={handleStatusChange} />;
	},
});

const routeTree = rootRoute.addChildren([
	indexRoute,
	authRoute.addChildren([loginRoute]),
	sellerRoute.addChildren([sellerDocumentsRoute]),
	adminRoute.addChildren([adminDocumentsRoute]),
]);

export const router = createRouter({ routeTree });
```

- [ ] **Step 3: Verify no TypeScript errors**

Run:

```bash
cd apps/web && npx tsc --noEmit 2>&1
```

Expected: no output (zero errors).

- [ ] **Step 4: Verify dev build compiles**

Run:

```bash
cd apps/web && npx vite build 2>&1 | tail -20
```

Expected: `✓ built in` with no errors.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/config/router.tsx
git commit -m "fix: replace deprecated TanStack Router constructors with create* functions"
```
