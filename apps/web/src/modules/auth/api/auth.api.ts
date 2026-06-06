import { api } from '../../../lib/api';

export interface LoginRequest {
	email: string;
	password: string;
}

export interface LoginResponse {
	userId: string;
	role: string;
	name: string;
	email: string;
}

export const authApi = {
	login: (credentials: LoginRequest): Promise<LoginResponse> => {
		return api.post('/auth/login', credentials);
	},
};
