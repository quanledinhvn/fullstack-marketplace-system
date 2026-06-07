import type { TDocumentResponse } from '@app/shared';
import { api } from '@/lib/api';

export interface UploadDocumentBody {
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export async function listDocuments(): Promise<TDocumentResponse[]> {
  const res = await api.get<any, any, any>('/documents');
  if (!res.success) throw new Error(res.error);
  return res.data;
}

export async function uploadDocument(body: UploadDocumentBody): Promise<TDocumentResponse> {
  const res = await api.post<any, any, any>('/documents', body);
  if (!res.success) throw new Error(res.error);
  return res.data;
}
