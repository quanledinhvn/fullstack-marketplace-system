import type { IDocumentResponse } from '@app/shared';
import { DocumentStatus } from '@app/shared';
import { Badge } from '@/components/ui/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

interface Props {
	documents: IDocumentResponse[];
}

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

const STATUS_LABEL: Record<DocumentStatus, string> = {
	[DocumentStatus.PROCESSING]: 'Processing',
	[DocumentStatus.VERIFIED]: 'Verified',
	[DocumentStatus.REJECTED]: 'Rejected',
	[DocumentStatus.INCONCLUSIVE]: 'Inconclusive',
	[DocumentStatus.ERROR]: 'Processing',
};

const STATUS_VARIANT: Record<DocumentStatus, BadgeVariant> = {
	[DocumentStatus.PROCESSING]: 'secondary',
	[DocumentStatus.VERIFIED]: 'default',
	[DocumentStatus.REJECTED]: 'destructive',
	[DocumentStatus.INCONCLUSIVE]: 'outline',
	[DocumentStatus.ERROR]: 'secondary',
};

function formatFileSize(bytes: number): string {
	if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

	if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;

	return `${bytes} B`;
}

function formatDate(date: Date | string): string {
	return new Date(date).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
}

export function DocumentsTable({ documents }: Props) {
	if (documents.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<p className="text-muted-foreground">No documents yet</p>
				<p className="text-sm text-muted-foreground">Upload a document to get started.</p>
			</div>
		);
	}

	return (
		<div className="max-w-3xl mx-auto">
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>File name</TableHead>
					<TableHead>Size</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Uploaded</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{documents.map((doc) => (
					<TableRow key={doc.id}>
						<TableCell className="font-medium">{doc.fileName}</TableCell>
						<TableCell className="text-muted-foreground">{formatFileSize(doc.fileSize)}</TableCell>
						<TableCell>
							<Badge variant={STATUS_VARIANT[doc.status]}>{STATUS_LABEL[doc.status]}</Badge>
						</TableCell>
						<TableCell className="text-muted-foreground">{formatDate(doc.createdAt)}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
		</div>
	);
}
