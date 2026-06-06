import { Outlet } from '@tanstack/react-router';
import '../styles/auth-layout.css';

export function AuthLayout() {
	return (
		<div className="auth-layout">
			<Outlet />
		</div>
	);
}
