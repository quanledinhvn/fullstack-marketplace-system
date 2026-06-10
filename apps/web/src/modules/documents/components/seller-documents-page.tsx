import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useDocuments } from '../hooks/use-documents';
import { DocumentsTable } from './documents-table';
import { UploadDocumentDialog } from './upload-document-dialog';

export function SellerDocumentsPage() {
	const { documents, refresh } = useDocuments();
	const [dialogOpen, setDialogOpen] = useState(false);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">My Documents</h1>
				<Button onClick={() => setDialogOpen(true)}>+ Upload</Button>
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
