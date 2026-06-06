import { Outlet } from '@tanstack/react-router';
import { useAuthStore } from '../modules/auth/stores/auth.store';

export function DashboardLayout() {
	const user = useAuthStore((state) => state.user);
	const clearUser = useAuthStore((state) => state.clearUser);

	const handleLogout = () => {
		clearUser();
		window.location.href = '/login';
	};

	return (
		<div className="dashboard-layout">
			<header className="dashboard-header">
				<h1>DocVerify</h1>
				<div className="user-menu">
					<span>{user?.name}</span>
					<button onClick={handleLogout}>Logout</button>
				</div>
			</header>
			<main className="dashboard-content">
				<Outlet />
			</main>
		</div>
	);
}
