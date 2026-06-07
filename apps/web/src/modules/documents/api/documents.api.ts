import type { TDocumentResponse } from '@app/shared';
import { api } from '@/lib/api';

export interface UploadDocumentBody {
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export async function listDocuments(): Promise<TDocumentResponse[]> {
  return api.get('/documents');
}

export async function uploadDocument(body: UploadDocumentBody): Promise<TDocumentResponse> {
  return api.post('/documents', body);
}
