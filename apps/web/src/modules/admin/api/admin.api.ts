import type { TAdminDocumentResponse } from '@app/shared';
import { api } from '@/lib/api';

export async function listAllDocuments(status?: string): Promise<TAdminDocumentResponse[]> {
  const res = await api.get<any, any, any>('/admin/documents', { params: status ? { status } : {} });
  if (!res.success) throw new Error(res.error);
  return res.data;
}
