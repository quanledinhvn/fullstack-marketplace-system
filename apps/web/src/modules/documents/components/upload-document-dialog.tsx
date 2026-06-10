import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { uploadFileSchema } from '../schemas/document.schema';
import type { UploadDocumentBody } from '../api/documents.api';
import { uploadDocument } from '../api/documents.api';

interface Props {
	open: boolean;
	onClose: () => void;
	onSuccess: () => void;
	uploadFn?: (body: UploadDocumentBody) => Promise<unknown>;
}

export function UploadDocumentDialog({
	open,
	onClose,
	onSuccess,
	uploadFn = uploadDocument,
}: Props) {
	const [file, setFile] = useState<File | null>(null);
	const [validationError, setValidationError] = useState<string | null>(null);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	if (!open) return null;

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const f = e.target.files?.[0] ?? null;

		setValidationError(null);

		setUploadError(null);

		if (!f) {
			setFile(null);

			return;
		}

		const result = uploadFileSchema.safeParse(f);

		if (!result.success) {
			setValidationError(result.error.issues[0]?.message ?? 'Invalid file');

			setFile(null);

			return;
		}

		setFile(f);
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		if (!file) return;

		setLoading(true);

		setUploadError(null);

		try {
			await uploadFn({ fileName: file.name, fileSize: file.size, mimeType: file.type });

			onSuccess();

			onClose();
		} catch {
			setUploadError('Upload failed. Please try again.');
		} finally {
			setLoading(false);
		}
	}

	function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
		if (e.target === e.currentTarget) onClose();
	}

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
			role="dialog"
			aria-modal="true"
			onClick={handleOverlayClick}
		>
			<div className="relative w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg">
				<div className="mb-4 flex items-center justify-between">
					<h2 className="text-lg font-semibold">Upload document</h2>
					<button
						type="button"
						className="rounded-sm opacity-70 transition-opacity hover:opacity-100"
						onClick={onClose}
						aria-label="Close"
					>
						✕
					</button>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<label htmlFor="file-upload" className="text-sm font-medium leading-none">
							File
						</label>
						<input
							id="file-upload"
							type="file"
							accept=".pdf,.jpg,.jpeg,.png"
							onChange={handleFileChange}
							className="block w-full cursor-pointer text-sm text-foreground file:mr-4 file:rounded file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-secondary/80"
						/>
						{file && (
							<p className="text-sm text-muted-foreground">Selected: {file.name}</p>
						)}
						{validationError && (
							<p className="text-sm text-destructive">{validationError}</p>
						)}
						{uploadError && (
							<p className="text-sm text-destructive">{uploadError}</p>
						)}
					</div>

					<div className="flex justify-end gap-2">
						<Button type="button" variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit" disabled={!file || loading}>
							{loading ? 'Uploading…' : 'Upload'}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
