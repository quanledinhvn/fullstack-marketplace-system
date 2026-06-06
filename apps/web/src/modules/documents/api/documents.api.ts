import type { Document } from '@app/shared';
import { api } from '@/lib/api';

export interface UploadDocumentBody {
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export async function listDocuments(): Promise<Document[]> {
  return api.get('/documents');
}

export async function uploadDocument(body: UploadDocumentBody): Promise<Document> {
  return api.post('/documents', body);
}
