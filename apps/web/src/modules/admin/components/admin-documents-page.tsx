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
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">All Documents</h1>
        <StatusFilter value={status ?? ''} onChange={onStatusChange} />
      </div>
      {loading ? (
        <div className="loading">Loading…</div>
      ) : (
        <AdminDocumentsTable documents={documents as (typeof documents[0] & { sellerEmail: string })[]} />
      )}
    </div>
  );
}
