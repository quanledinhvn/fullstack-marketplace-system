import { IsIn, IsInt, IsString, Max, Min } from 'class-validator';

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'] as const;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export class UploadDocumentDto {
	@IsString()
	fileName!: string;

	@IsInt()
	@Min(1)
	@Max(MAX_FILE_SIZE)
	fileSize!: number;

	@IsIn(ALLOWED_MIME_TYPES)
	mimeType!: string;
}
