import { useState, useEffect, useCallback } from 'react';
import type { SubmissionView } from '@/types/form';
import { orgHeaders } from './useOrg';

export function useSubmissions(token: string, subdomain: string) {
  const [submissions, setSubmissions] = useState<SubmissionView[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!token || !subdomain) return;
    setLoading(true);
    try {
      const r = await fetch(
        `/api/submissions?subdomain=${encodeURIComponent(subdomain)}`,
        { headers: orgHeaders(token) }
      );
      if (r.ok) setSubmissions((await r.json()).submissions || []);
    } finally {
      setLoading(false);
    }
  }, [token, subdomain]);

  useEffect(() => {
    load();
  }, [load]);

  const markRead = async (id: string) => {
    await fetch(`/api/submissions/${id}`, { method: 'PATCH', headers: orgHeaders(token) });
    setSubmissions((s) => s.map((x) => (x._id === id ? { ...x, isRead: true } : x)));
  };

  return { submissions, loading, markRead, reload: load };
}
