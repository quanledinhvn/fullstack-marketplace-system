import { RootRoute, Route, Router, redirect } from '@tanstack/react-router';
import { AuthLayout } from '../layouts/auth-layout';
import { DashboardLayout } from '../layouts/dashboard-layout';
import { RootLayout } from '../layouts/root-layout';
import { LoginForm } from '../modules/auth/components/login-form';
import { useAuthStore } from '../modules/auth/stores/auth.store';
import { AdminDocumentsPage } from '../modules/admin/components/admin-documents-page';
import { SellerDocumentsPage } from '../modules/documents/components/seller-documents-page';

const rootRoute = new RootRoute({
	component: RootLayout,
});

const indexRoute = new Route({
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

const authRoute = new Route({
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

const loginRoute = new Route({
	getParentRoute: () => authRoute,
	path: '/login',
	component: LoginForm,
});

const sellerRoute = new Route({
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

const sellerDocumentsRoute = new Route({
	getParentRoute: () => sellerRoute,
	path: '/seller/documents',
	component: SellerDocumentsPage,
});

const adminRoute = new Route({
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

const adminDocumentsRoute = new Route({
	getParentRoute: () => adminRoute,
	path: '/admin/documents',
	validateSearch: (search: Record<string, unknown>) => ({
		status: typeof search.status === 'string' ? search.status : undefined,
	}),
	component: function AdminDocumentsRoute() {
		const { status } = adminDocumentsRoute.useSearch();
		const navigate = adminDocumentsRoute.useNavigate();
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

export const router = new Router({ routeTree });
