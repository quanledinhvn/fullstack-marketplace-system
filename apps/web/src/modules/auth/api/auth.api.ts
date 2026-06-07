import type { TAuthResponse } from '@app/shared';
import { api } from '../../../lib/api';

export interface LoginRequest {
	email: string;
	password: string;
}

export const authApi = {
	login: async (credentials: LoginRequest): Promise<TAuthResponse> => {
		const res = await api.post<any, any, any>('/auth/login', credentials);
		if (!res.success) throw new Error(res.error);
		return res.data;
	},
};
