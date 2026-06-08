import type { IAdminDocumentResponse } from '@app/shared';
import { DocumentStatus } from '@app/shared';

interface Props {
	documents: IAdminDocumentResponse[];
}

const STATUS_LABEL: Record<DocumentStatus, string> = {
	[DocumentStatus.PROCESSING]: 'Processing',
	[DocumentStatus.VERIFIED]: 'Verified',
	[DocumentStatus.REJECTED]: 'Rejected',
	[DocumentStatus.INCONCLUSIVE]: 'Inconclusive',
	[DocumentStatus.ERROR]: 'Error',
};

const STATUS_CLASS: Record<DocumentStatus, string> = {
	[DocumentStatus.PROCESSING]: 'badge-processing',
	[DocumentStatus.VERIFIED]: 'badge-verified',
	[DocumentStatus.REJECTED]: 'badge-rejected',
	[DocumentStatus.INCONCLUSIVE]: 'badge-inconclusive',
	[DocumentStatus.ERROR]: 'badge-error',
};

function formatDate(date: Date | string): string {
	return new Date(date).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
}

export function AdminDocumentsTable({ documents }: Props) {
	if (documents.length === 0) {
		return (
			<div className="empty">
				<p className="empty-title">No documents yet</p>
				<p>No documents match the selected filter.</p>
			</div>
		);
	}

	return (
		<div className="doc-table-wrap" style={{ display: 'block' }}>
			<table>
				<thead>
					<tr>
						<th>Seller</th>
						<th>File name</th>
						<th>Status</th>
						<th>Uploaded</th>
					</tr>
				</thead>
				<tbody>
					{documents.map((doc) => (
						<tr key={doc.id}>
							<td className="td-muted">{doc.sellerEmail}</td>
							<td className="td-name">{doc.fileName}</td>
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
