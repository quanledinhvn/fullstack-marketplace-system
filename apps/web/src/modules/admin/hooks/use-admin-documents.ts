import type { Document } from '@app/shared';
import { useEffect, useState } from 'react';
import { listAllDocuments } from '../api/admin.api';

export function useAdminDocuments(status?: string) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listAllDocuments(status).then((docs) => {
      if (!cancelled) {
        setDocuments(docs);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [status]);

  return { documents, loading };
}
