import type { TAdminDocumentResponse } from '@app/shared';
import { api } from '@/lib/api';

export async function listAllDocuments(status?: string): Promise<TAdminDocumentResponse[]> {
  return api.get('/admin/documents', { params: status ? { status } : {} });
}
