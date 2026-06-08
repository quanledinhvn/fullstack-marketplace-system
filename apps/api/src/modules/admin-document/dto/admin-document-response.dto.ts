import { Exclude, Expose } from 'class-transformer';
import type { IAdminDocumentResponse } from '@app/shared';
import { DocumentStatus } from '@app/shared';

@Exclude()
export class AdminDocumentResponseDto implements IAdminDocumentResponse {
	@Expose()
	id!: string;

	@Expose()
	userId!: string;

	@Expose()
	fileName!: string;

	@Expose()
	fileSize!: number;

	@Expose()
	status!: DocumentStatus;

	@Expose()
	verificationId!: string | null;

	@Expose()
	jobId!: string | null;

	@Expose()
	createdAt!: Date;

	@Expose()
	updatedAt!: Date;

	@Expose()
	sellerEmail!: string;
}
