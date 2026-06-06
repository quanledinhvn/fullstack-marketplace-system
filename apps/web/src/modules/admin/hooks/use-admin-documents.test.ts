import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../api/admin.api', () => ({
  listAllDocuments: vi.fn(),
}));

import { listAllDocuments } from '../api/admin.api';
import { useAdminDocuments } from './use-admin-documents';

const mockList = listAllDocuments as ReturnType<typeof vi.fn>;

afterEach(() => vi.clearAllMocks());

describe('useAdminDocuments', () => {
  it('fetches all documents on mount', async () => {
    const docs = [{ id: '1', fileName: 'a.pdf', status: 'pending' }];
    mockList.mockResolvedValueOnce(docs);

    const { result } = renderHook(() => useAdminDocuments());

    await waitFor(() => expect(result.current.documents).toEqual(docs));
    expect(mockList).toHaveBeenCalledWith(undefined);
  });

  it('re-fetches when status filter changes', async () => {
    const all = [{ id: '1', status: 'verified' }, { id: '2', status: 'inconclusive' }];
    const filtered = [{ id: '2', status: 'inconclusive' }];
    mockList.mockResolvedValueOnce(all).mockResolvedValueOnce(filtered);

    const { result, rerender } = renderHook(({ status }) => useAdminDocuments(status), {
      initialProps: { status: undefined as string | undefined },
    });

    await waitFor(() => expect(result.current.documents).toEqual(all));
    expect(mockList).toHaveBeenCalledWith(undefined);

    rerender({ status: 'inconclusive' });

    await waitFor(() => expect(result.current.documents).toEqual(filtered));
    expect(mockList).toHaveBeenCalledWith('inconclusive');
  });
});
