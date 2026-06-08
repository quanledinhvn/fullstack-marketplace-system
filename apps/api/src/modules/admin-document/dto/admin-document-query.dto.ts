import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { DocumentStatus } from '@prisma/client';

export class AdminDocumentQueryDto {
	@IsOptional()
	@IsEnum(DocumentStatus)
	status?: DocumentStatus;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	limit?: number;
}
