import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { IDocumentResponse } from '@app/shared';
import { DocumentStatus } from '@app/shared';
import { DocumentsTable } from './documents-table';

const makeDoc = (overrides: Partial<IDocumentResponse>): IDocumentResponse => ({
	id: '1',
	userId: 'u1',
	fileName: 'test.pdf',
	fileSize: 1024,
	status: DocumentStatus.PROCESSING,
	verificationId: null,
	jobId: null,
	createdAt: new Date('2026-06-07'),
	updatedAt: new Date('2026-06-07'),
	...overrides,
});

describe('DocumentsTable', () => {
	it('renders document filename and file size', () => {
		render(
			<DocumentsTable
				documents={[makeDoc({ fileName: 'passport.pdf', fileSize: 2 * 1024 * 1024 })]}
			/>,
		);

		expect(screen.getByText('passport.pdf')).toBeInTheDocument();

		expect(screen.getByText('2.0 MB')).toBeInTheDocument();
	});

	it('renders status badge for verified', () => {
		render(<DocumentsTable documents={[makeDoc({ status: DocumentStatus.VERIFIED })]} />);

		expect(screen.getByText('Verified')).toBeInTheDocument();
	});

	it('renders status badge for rejected', () => {
		render(<DocumentsTable documents={[makeDoc({ status: DocumentStatus.REJECTED })]} />);

		expect(screen.getByText('Rejected')).toBeInTheDocument();
	});

	it('renders status badge for inconclusive', () => {
		render(<DocumentsTable documents={[makeDoc({ status: DocumentStatus.INCONCLUSIVE })]} />);

		expect(screen.getByText('Inconclusive')).toBeInTheDocument();
	});

	it('renders ERROR status as "Processing" — not exposed to seller', () => {
		render(<DocumentsTable documents={[makeDoc({ status: DocumentStatus.ERROR })]} />);

		expect(screen.getByText('Processing')).toBeInTheDocument();

		expect(screen.queryByText('Error')).not.toBeInTheDocument();
	});

	it('renders empty state when no documents', () => {
		render(<DocumentsTable documents={[]} />);

		expect(screen.getByText(/no documents/i)).toBeInTheDocument();
	});

	it('renders uploaded date', () => {
		render(<DocumentsTable documents={[makeDoc({ createdAt: new Date('2026-06-05') })]} />);

		expect(screen.getByText('Jun 5, 2026')).toBeInTheDocument();
	});
});
