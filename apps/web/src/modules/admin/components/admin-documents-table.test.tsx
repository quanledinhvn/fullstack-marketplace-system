import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { IAdminDocumentResponse } from '@app/shared';
import { DocumentStatus } from '@app/shared';
import { AdminDocumentsTable } from './admin-documents-table';

const makeDoc = (overrides: Partial<IAdminDocumentResponse>): IAdminDocumentResponse => ({
	id: '1',
	userId: 'u1',
	fileName: 'test.pdf',
	fileSize: 1024,
	status: DocumentStatus.PROCESSING,
	verificationId: null,
	jobId: null,
	createdAt: new Date('2026-06-07'),
	updatedAt: new Date('2026-06-07'),
	sellerEmail: 'seller@test.com',
	...overrides,
});

describe('AdminDocumentsTable', () => {
	it('renders seller email, filename, and uploaded date', () => {
		render(
			<AdminDocumentsTable
				documents={[makeDoc({ fileName: 'passport.pdf', sellerEmail: 'alice@co.com' })]}
			/>,
		);

		expect(screen.getByText('alice@co.com')).toBeInTheDocument();

		expect(screen.getByText('passport.pdf')).toBeInTheDocument();

		expect(screen.getByText('Jun 7, 2026')).toBeInTheDocument();
	});

	it('renders status badge for verified', () => {
		render(<AdminDocumentsTable documents={[makeDoc({ status: DocumentStatus.VERIFIED })]} />);

		expect(screen.getByText('Verified')).toBeInTheDocument();
	});

	it('renders status badge for inconclusive', () => {
		render(<AdminDocumentsTable documents={[makeDoc({ status: DocumentStatus.INCONCLUSIVE })]} />);

		expect(screen.getByText('Inconclusive')).toBeInTheDocument();
	});

	it('renders status badge for error', () => {
		render(<AdminDocumentsTable documents={[makeDoc({ status: DocumentStatus.ERROR })]} />);

		expect(screen.getByText('Error')).toBeInTheDocument();
	});

	it('renders empty state when no documents', () => {
		render(<AdminDocumentsTable documents={[]} />);

		expect(screen.getByText('No documents yet')).toBeInTheDocument();
	});
});
