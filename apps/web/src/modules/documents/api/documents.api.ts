import type { IDocumentResponse } from '@app/shared';
import { api } from '@/lib/api';

export interface UploadDocumentBody {
	fileName: string;
	fileSize: number;
	mimeType: string;
}

export async function listDocuments(): Promise<IDocumentResponse[]> {
	return api.get('/documents');
}

export async function uploadDocument(body: UploadDocumentBody): Promise<IDocumentResponse> {
	return api.post('/documents', body);
}
