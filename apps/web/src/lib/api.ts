import axios from 'axios';
import { useAuthStore } from '../modules/auth/stores/auth.store';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
	baseURL: `${API_BASE}/api`,
	headers: {
		'Content-Type': 'application/json',
	},
});

api.interceptors.request.use((config) => {
	const user = useAuthStore.getState().user;
	if (user?.userId) {
		config.headers.Authorization = user.userId;
	}
	return config;
});

api.interceptors.response.use(
	(response) => response.data,
	(error) => {
		if (error.response?.status === 401) {
			useAuthStore.getState().clearUser();
			window.location.href = '/login';
		}
		return Promise.reject(error);
	},
);
