import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { api } from '@/lib/api';
import { listDocuments, uploadDocument } from './documents.api';

const mockApi = api as { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> };

describe('listDocuments', () => {
  afterEach(() => vi.clearAllMocks());

  it('calls GET /documents and returns the data', async () => {
    const docs = [{ id: '1', fileName: 'a.pdf', fileSize: 100, status: 'PENDING' }];
    mockApi.get.mockResolvedValueOnce(docs);

    const result = await listDocuments();

    expect(mockApi.get).toHaveBeenCalledWith('/documents');
    expect(result).toEqual(docs);
  });
});

describe('uploadDocument', () => {
  afterEach(() => vi.clearAllMocks());

  it('calls POST /documents with fileName/fileSize/mimeType and returns doc', async () => {
    const doc = { id: '2', fileName: 'b.jpg', fileSize: 200, status: 'PENDING' };
    mockApi.post.mockResolvedValueOnce(doc);

    const result = await uploadDocument({ fileName: 'b.jpg', fileSize: 200, mimeType: 'image/jpeg' });

    expect(mockApi.post).toHaveBeenCalledWith('/documents', { fileName: 'b.jpg', fileSize: 200, mimeType: 'image/jpeg' });
    expect(result).toEqual(doc);
  });
});
