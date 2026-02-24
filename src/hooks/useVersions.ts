import { useState, useEffect, useCallback } from 'react';
import type { VersionView } from '@/types';
import { orgHeaders } from './useOrg';

export function useVersions(token: string, subdomain: string) {
  const [versions, setVersions] = useState<VersionView[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchVersions = useCallback(async () => {
    if (!token || !subdomain) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/subdomains/${subdomain}/versions`, {
        headers: orgHeaders(token),
      });
      if (r.ok) setVersions((await r.json()).versions || []);
    } finally {
      setLoading(false);
    }
  }, [token, subdomain]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const restore = async (version: number) => {
    const r = await fetch(
      `/api/subdomains/${subdomain}/versions/${version}/restore`,
      { method: 'POST', headers: orgHeaders(token) }
    );
    if (!r.ok) throw new Error('Restore failed');
    await fetchVersions();
  };

  const publish = async () => {
    const r = await fetch(`/api/subdomains/${subdomain}/publish`, {
      method: 'POST',
      headers: orgHeaders(token),
    });
    if (!r.ok) throw new Error('Publish failed');
  };

  return { versions, loading, restore, publish, refetch: fetchVersions };
}
