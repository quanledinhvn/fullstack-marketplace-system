import type { GreetingRequest } from '@app/shared';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateGreetingDto implements GreetingRequest {
	@IsString()
	@IsNotEmpty()
	@MaxLength(50)
	name!: string;
}
