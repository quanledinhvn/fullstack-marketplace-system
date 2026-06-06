import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { DocumentStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class DocumentQueryDto {
	@IsOptional()
	@IsEnum(DocumentStatus)
	status?: DocumentStatus;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number = 1;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(100)
	limit?: number = 20;
}
