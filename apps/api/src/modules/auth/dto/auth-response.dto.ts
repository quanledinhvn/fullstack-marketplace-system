import { Expose } from 'class-transformer';
import type { TAuthResponse } from '@app/shared';

export class AuthResponseDto implements TAuthResponse {
  @Expose()
  userId!: string;

  @Expose()
  role!: 'seller' | 'admin';

  @Expose()
  name!: string;

  @Expose()
  email!: string;
}
