import type { Document } from '@app/shared';
import { DocumentStatus } from '@app/shared';

interface Props {
  documents: Document[];
}

const STATUS_LABEL: Record<DocumentStatus, string> = {
  [DocumentStatus.PENDING]: 'Pending',
  [DocumentStatus.PROCESSING]: 'Processing',
  [DocumentStatus.VERIFIED]: 'Verified',
  [DocumentStatus.REJECTED]: 'Rejected',
  [DocumentStatus.INCONCLUSIVE]: 'Inconclusive',
  [DocumentStatus.ERROR]: 'Processing', // never shown as "Error" to seller
};

const STATUS_CLASS: Record<DocumentStatus, string> = {
  [DocumentStatus.PENDING]: 'badge-pending',
  [DocumentStatus.PROCESSING]: 'badge-processing',
  [DocumentStatus.VERIFIED]: 'badge-verified',
  [DocumentStatus.REJECTED]: 'badge-rejected',
  [DocumentStatus.INCONCLUSIVE]: 'badge-inconclusive',
  [DocumentStatus.ERROR]: 'badge-processing',
};

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function DocumentsTable({ documents }: Props) {
  if (documents.length === 0) {
    return (
      <div className="empty">
        <p className="empty-title">No documents yet</p>
        <p>Upload a document to get started.</p>
      </div>
    );
  }

  return (
    <div className="doc-table-wrap" style={{ display: 'block' }}>
      <table>
        <thead>
          <tr>
            <th>File name</th>
            <th>Size</th>
            <th>Status</th>
            <th>Uploaded</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id}>
              <td className="td-name">{doc.fileName}</td>
              <td className="td-muted">{formatFileSize(doc.fileSize)}</td>
              <td>
                <span className={`badge ${STATUS_CLASS[doc.status]}`}>
                  {STATUS_LABEL[doc.status]}
                </span>
              </td>
              <td className="td-muted">{formatDate(doc.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
