import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

import { api } from '@/lib/api';
import { listAllDocuments } from './admin.api';

const mockApi = api as unknown as { get: ReturnType<typeof vi.fn> };

afterEach(() => vi.clearAllMocks());

describe('listAllDocuments', () => {
  it('calls GET /admin/documents without filter', async () => {
    const docs = [{ id: '1', fileName: 'a.pdf', status: 'processing' }];
    mockApi.get.mockResolvedValueOnce(docs);

    const result = await listAllDocuments();

    expect(mockApi.get).toHaveBeenCalledWith('/admin/documents', { params: {} });
    expect(result).toEqual(docs);
  });

  it('calls GET /admin/documents with status filter', async () => {
    const docs = [{ id: '2', fileName: 'b.pdf', status: 'inconclusive' }];
    mockApi.get.mockResolvedValueOnce(docs);

    const result = await listAllDocuments('inconclusive');

    expect(mockApi.get).toHaveBeenCalledWith('/admin/documents', { params: { status: 'inconclusive' } });
    expect(result).toEqual(docs);
  });
});
