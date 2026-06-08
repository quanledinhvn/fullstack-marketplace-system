import { useState } from 'react';
import type { UploadDocumentBody } from '../api/documents.api';
import { uploadDocument } from '../api/documents.api';

export function useUploadDocument(refresh: () => void) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function upload(body: UploadDocumentBody) {
		setLoading(true);

		setError(null);

		try {
			await uploadDocument(body);

			refresh();
		} catch {
			setError('Upload failed. Please try again.');
		} finally {
			setLoading(false);
		}
	}

	return { upload, loading, error };
}
