import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UploadDocumentDialog } from './upload-document-dialog';

let onClose: () => void;
let onSuccess: () => void;

beforeEach(() => {
	onClose = vi.fn();

	onSuccess = vi.fn();
});

function makeFile(name: string, size: number, type: string) {
	return new File(['x'.repeat(size)], name, { type });
}

describe('UploadDocumentDialog', () => {
	it('renders when open', () => {
		render(<UploadDocumentDialog open onClose={onClose} onSuccess={onSuccess} />);

		expect(screen.getByText(/upload document/i)).toBeInTheDocument();
	});

	it('does not render when closed', () => {
		render(<UploadDocumentDialog open={false} onClose={onClose} onSuccess={onSuccess} />);

		expect(screen.queryByText(/upload document/i)).not.toBeInTheDocument();
	});

	it('shows error for unsupported file type', async () => {
		const user = userEvent.setup({ applyAccept: false });

		render(<UploadDocumentDialog open onClose={onClose} onSuccess={onSuccess} />);

		const input = screen.getByLabelText(/file/i);

		await user.upload(input, makeFile('doc.txt', 100, 'text/plain'));

		expect(await screen.findByText(/pdf, jpg, or png/i)).toBeInTheDocument();
	});

	it('shows error for file over 10MB', async () => {
		const user = userEvent.setup();

		render(<UploadDocumentDialog open onClose={onClose} onSuccess={onSuccess} />);

		const input = screen.getByLabelText(/file/i);

		await user.upload(input, makeFile('big.pdf', 10 * 1024 * 1024 + 1, 'application/pdf'));

		expect(await screen.findByText(/10mb/i)).toBeInTheDocument();
	});

	it('calls onSuccess after successful upload', async () => {
		const user = userEvent.setup();
		const mockUpload = vi.fn().mockResolvedValueOnce({ id: '1' });

		render(
			<UploadDocumentDialog open onClose={onClose} onSuccess={onSuccess} uploadFn={mockUpload} />,
		);

		const input = screen.getByLabelText(/file/i);

		await user.upload(input, makeFile('passport.pdf', 100, 'application/pdf'));

		await user.click(screen.getByRole('button', { name: /upload/i }));

		await waitFor(() => expect(onSuccess).toHaveBeenCalled());

		expect(mockUpload).toHaveBeenCalledWith({
			fileName: 'passport.pdf',
			fileSize: 100,
			mimeType: 'application/pdf',
		});
	});

	it('shows generic error message on upload failure', async () => {
		const user = userEvent.setup();
		const mockUpload = vi.fn().mockRejectedValueOnce(new Error('Internal server error'));

		render(
			<UploadDocumentDialog open onClose={onClose} onSuccess={onSuccess} uploadFn={mockUpload} />,
		);

		const input = screen.getByLabelText(/file/i);

		await user.upload(input, makeFile('passport.pdf', 100, 'application/pdf'));

		await user.click(screen.getByRole('button', { name: /upload/i }));

		expect(await screen.findByText(/failed|try again/i)).toBeInTheDocument();

		expect(onSuccess).not.toHaveBeenCalled();
	});

	it('calls onClose when cancel is clicked', async () => {
		const user = userEvent.setup();

		render(<UploadDocumentDialog open onClose={onClose} onSuccess={onSuccess} />);

		await user.click(screen.getByRole('button', { name: /cancel/i }));

		expect(onClose).toHaveBeenCalled();
	});
});
