import type { Document } from '@app/shared';
import { api } from '@/lib/api';

export async function listAllDocuments(status?: string): Promise<Document[]> {
  return api.get('/admin/documents', { params: status ? { status } : {} });
}
