import type { IAdminDocumentResponse } from '@app/shared';
import { DocumentStatus } from '@app/shared';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Props { documents: IAdminDocumentResponse[]; }

const STATUS_LABEL: Record<DocumentStatus, string> = {
  [DocumentStatus.PROCESSING]: 'Processing',
  [DocumentStatus.VERIFIED]: 'Verified',
  [DocumentStatus.REJECTED]: 'Rejected',
  [DocumentStatus.INCONCLUSIVE]: 'Inconclusive',
  [DocumentStatus.ERROR]: 'Error',
};

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

const STATUS_VARIANT: Record<DocumentStatus, BadgeVariant> = {
  [DocumentStatus.PROCESSING]: 'secondary',
  [DocumentStatus.VERIFIED]: 'default',
  [DocumentStatus.REJECTED]: 'destructive',
  [DocumentStatus.INCONCLUSIVE]: 'outline',
  [DocumentStatus.ERROR]: 'destructive',
};

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function AdminDocumentsTable({ documents }: Props) {
  if (documents.length === 0) {
    return (
      <p>No documents yet</p>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Seller</TableHead>
          <TableHead>File name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Uploaded</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((doc) => (
          <TableRow key={doc.id}>
            <TableCell className="text-muted-foreground">{doc.sellerEmail}</TableCell>
            <TableCell>{doc.fileName}</TableCell>
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
