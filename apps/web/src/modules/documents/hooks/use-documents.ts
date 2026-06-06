import type { Document } from '@app/shared';
import { useCallback, useEffect, useState } from 'react';
import { listDocuments } from '../api/documents.api';

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const docs = await listDocuments();
      setDocuments(docs);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    listDocuments().then((docs) => {
      if (!cancelled) setDocuments(docs);
    });
    return () => { cancelled = true; };
  }, []);

  return { documents, loading, refresh: fetch };
}
