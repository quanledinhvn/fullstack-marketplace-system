import { IsEnum, IsString } from 'class-validator';
import { DocumentStatus } from '@prisma/client';

export class WebhookResultDto {
	@IsString()
	verificationId!: string;

	@IsString()
	documentId!: string;

	@IsEnum(DocumentStatus)
	result!: DocumentStatus;
}
