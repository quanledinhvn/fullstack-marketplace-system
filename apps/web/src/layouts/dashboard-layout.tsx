import { Outlet } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '../modules/auth/stores/auth.store';

export function DashboardLayout() {
	const user = useAuthStore((state) => state.user);
	const clearUser = useAuthStore((state) => state.clearUser);

	const handleLogout = () => {
		clearUser();

		window.location.href = '/login';
	};

	return (
		<div className="min-h-screen flex flex-col">
			<header className="border-b bg-background px-6 py-3 flex items-center justify-between">
				<h1 className="text-lg font-semibold">DocVerify</h1>

				<div className="flex items-center gap-3">
					<span className="text-sm text-muted-foreground">{user?.name}</span>

					<Button variant="ghost" size="sm" onClick={handleLogout}>
						Logout
					</Button>
				</div>
			</header>

			<main className="flex-1 p-6">
				<Outlet />
			</main>
		</div>
	);
}
