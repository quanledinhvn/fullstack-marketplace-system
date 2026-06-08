import { useState } from 'react';
import { useDocuments } from '../hooks/use-documents';
import { DocumentsTable } from './documents-table';
import { UploadDocumentDialog } from './upload-document-dialog';

export function SellerDocumentsPage() {
	const { documents, refresh } = useDocuments();
	const [dialogOpen, setDialogOpen] = useState(false);

	return (
		<div className="page">
			<div className="page-header">
				<h1 className="page-title">My Documents</h1>
				<button className="btn-primary" onClick={() => setDialogOpen(true)}>
					+ Upload
				</button>
			</div>

			<DocumentsTable documents={documents} />

			<UploadDocumentDialog
				open={dialogOpen}
				onClose={() => setDialogOpen(false)}
				onSuccess={() => {
					setDialogOpen(false);

					refresh();
				}}
			/>
		</div>
	);
}
