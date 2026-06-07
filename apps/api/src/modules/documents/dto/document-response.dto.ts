import { Expose } from 'class-transformer';
import type { TDocumentResponse } from '@app/shared';
import { DocumentStatus } from '@app/shared';

export class DocumentResponseDto implements TDocumentResponse {
  @Expose() id!: string;
  @Expose() userId!: string;
  @Expose() fileName!: string;
  @Expose() fileSize!: number;
  @Expose() status!: DocumentStatus;
  @Expose() verificationId!: string | null;
  @Expose() jobId!: string | null;
  @Expose() createdAt!: Date;
  @Expose() updatedAt!: Date;
}
