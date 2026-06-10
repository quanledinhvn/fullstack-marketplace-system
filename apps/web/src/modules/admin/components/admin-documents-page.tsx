import { useAdminDocuments } from '../hooks/use-admin-documents';
import { AdminDocumentsTable } from './admin-documents-table';
import { StatusFilter } from './status-filter';

interface Props {
	status?: string;
	onStatusChange: (status: string) => void;
}

export function AdminDocumentsPage({ status, onStatusChange }: Props) {
	const { documents, loading } = useAdminDocuments(status || undefined);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">All Documents</h1>
				<StatusFilter value={status ?? ''} onChange={onStatusChange} />
			</div>
			{loading ? (
				<p className="text-muted-foreground">Loading…</p>
			) : (
				<AdminDocumentsTable
					documents={documents as ((typeof documents)[0] & { sellerEmail: string })[]}
				/>
			)}
		</div>
	);
}
