import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../api/documents.api', () => ({
  listDocuments: vi.fn(),
}));

import { listDocuments } from '../api/documents.api';
import { useDocuments } from './use-documents';

const mockList = listDocuments as ReturnType<typeof vi.fn>;

afterEach(() => vi.clearAllMocks());

describe('useDocuments', () => {
  it('fetches documents on mount', async () => {
    const docs = [{ id: '1', fileName: 'a.pdf', status: 'VERIFIED' }];
    mockList.mockResolvedValueOnce(docs);

    const { result } = renderHook(() => useDocuments());

    await waitFor(() => expect(result.current.documents).toEqual(docs));
    expect(mockList).toHaveBeenCalledTimes(1);
  });

  it('exposes a refresh function that re-fetches', async () => {
    const docs = [{ id: '1', status: 'VERIFIED' }];
    const updated = [{ id: '1', status: 'VERIFIED' }, { id: '2', status: 'PENDING' }];
    mockList.mockResolvedValueOnce(docs).mockResolvedValueOnce(updated);

    const { result } = renderHook(() => useDocuments());
    await waitFor(() => expect(result.current.documents).toEqual(docs));

    await act(async () => { result.current.refresh(); });
    await waitFor(() => expect(result.current.documents).toEqual(updated));
  });
});
