import { Exclude, Expose } from 'class-transformer';
import type { IAuthResponse } from '@app/shared';

@Exclude()
export class AuthResponseDto implements IAuthResponse {
	@Expose()
	userId!: string;

	@Expose()
	role!: 'seller' | 'admin';

	@Expose()
	name!: string;

	@Expose()
	email!: string;
}
