import type { IAdminDocumentResponse } from '@app/shared';
import { api } from '@/lib/api';

export async function listAllDocuments(status?: string): Promise<IAdminDocumentResponse[]> {
	return api.get('/admin/documents', {
		params: status ? { status } : {},
	});
}
