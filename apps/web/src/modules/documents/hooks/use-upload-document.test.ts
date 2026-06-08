import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../api/documents.api', () => ({
	uploadDocument: vi.fn(),
}));

import { uploadDocument } from '../api/documents.api';
import { useUploadDocument } from './use-upload-document';

const mockUpload = uploadDocument as ReturnType<typeof vi.fn>;
const mockRefresh = vi.fn();

afterEach(() => vi.clearAllMocks());

describe('useUploadDocument', () => {
	it('calls uploadDocument and then refresh on success', async () => {
		const doc = { id: '1', fileName: 'a.pdf', status: 'PROCESSING' };

		mockUpload.mockResolvedValueOnce(doc);

		const { result } = renderHook(() => useUploadDocument(mockRefresh));

		await act(async () => {
			await result.current.upload({
				fileName: 'a.pdf',
				fileSize: 100,
				mimeType: 'application/pdf',
			});
		});

		expect(mockUpload).toHaveBeenCalledWith({
			fileName: 'a.pdf',
			fileSize: 100,
			mimeType: 'application/pdf',
		});

		expect(mockRefresh).toHaveBeenCalledTimes(1);
	});

	it('sets loading true during upload', async () => {
		let resolveUpload!: () => void;

		mockUpload.mockReturnValueOnce(
			new Promise((r) => {
				resolveUpload = () => r({ id: '1' });
			}),
		);

		const { result } = renderHook(() => useUploadDocument(mockRefresh));

		act(() => {
			result.current.upload({ fileName: 'a.pdf', fileSize: 100, mimeType: 'application/pdf' });
		});

		await waitFor(() => expect(result.current.loading).toBe(true));

		await act(async () => {
			resolveUpload();
		});

		await waitFor(() => expect(result.current.loading).toBe(false));
	});

	it('sets error on failure without leaking internal details', async () => {
		mockUpload.mockRejectedValueOnce(new Error('Internal server error with stack trace'));

		const { result } = renderHook(() => useUploadDocument(mockRefresh));

		await act(async () => {
			await result.current.upload({
				fileName: 'a.pdf',
				fileSize: 100,
				mimeType: 'application/pdf',
			});
		});

		expect(result.current.error).toBeTruthy();

		expect(result.current.error).not.toContain('stack trace');

		expect(mockRefresh).not.toHaveBeenCalled();
	});

	it('clears error on subsequent successful upload', async () => {
		mockUpload.mockRejectedValueOnce(new Error('fail'));

		mockUpload.mockResolvedValueOnce({ id: '1' });

		const { result } = renderHook(() => useUploadDocument(mockRefresh));

		await act(async () => {
			await result.current.upload({
				fileName: 'a.pdf',
				fileSize: 100,
				mimeType: 'application/pdf',
			});
		});

		expect(result.current.error).toBeTruthy();

		await act(async () => {
			await result.current.upload({
				fileName: 'a.pdf',
				fileSize: 100,
				mimeType: 'application/pdf',
			});
		});

		expect(result.current.error).toBeNull();
	});
});
