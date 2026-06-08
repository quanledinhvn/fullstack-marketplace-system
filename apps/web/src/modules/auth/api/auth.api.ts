import type { IAuthResponse } from '@app/shared';
import { api } from '../../../lib/api';

export interface LoginRequest {
	email: string;
	password: string;
}

export const authApi = {
	login: async (credentials: LoginRequest): Promise<IAuthResponse> => {
		return api.post('/auth/login', credentials);
	},
};
