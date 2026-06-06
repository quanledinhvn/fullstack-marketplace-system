import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../stores/auth.store';

export function LoginForm() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const navigate = useNavigate();
	const setUser = useAuthStore((state) => state.setUser);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			const response = await authApi.login({ email, password });
			setUser({
				userId: response.userId,
				role: response.role as 'seller' | 'admin',
				name: response.name,
				email: response.email,
			});

			if (response.role === 'seller') {
				await navigate({ to: '/seller/documents' });
			} else if (response.role === 'admin') {
				await navigate({ to: '/admin/documents' });
			}
		} catch (err: any) {
			setError(err.response?.data?.message || 'Invalid email or password');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="card">
			<div className="logo">DocVerify</div>
			<div className="subtitle">Document Verification Platform</div>

			<form onSubmit={handleSubmit}>
				<div className="field">
					<label htmlFor="email">Email</label>
					<input
						id="email"
						type="email"

						value={email}
						onChange={(e) => setEmail(e.target.value)}
						disabled={loading}
					/>
				</div>

				<div className="field">
					<label htmlFor="password">Password</label>
					<input
						id="password"
						type="password"

						value={password}
						onChange={(e) => setPassword(e.target.value)}
						disabled={loading}
					/>
					{error && <div className="field-error">{error}</div>}
				</div>

				<button type="submit" disabled={loading}>
					{loading ? 'Signing in...' : 'Sign in'}
				</button>
			</form>
		</div>
	);
}
