import { useState, useEffect, useCallback } from 'react';
import type { Org } from '@/types/org';

const ORG_KEY = 'currentOrgId';

export function getCurrentOrgId(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(ORG_KEY) || '';
}

export function setStoredOrgId(id: string): void {
  if (typeof window !== 'undefined') localStorage.setItem(ORG_KEY, id);
}

/** Authorization + x-org-id headers for org-scoped requests. */
export function orgHeaders(token: string): Record<string, string> {
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const orgId = getCurrentOrgId();
  if (orgId) headers['x-org-id'] = orgId;
  return headers;
}

export function useOrg(token: string) {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [currentOrgId, setCurrentOrgIdState] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchOrgs = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch('/api/orgs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const list: Org[] = data.orgs || [];
      setOrgs(list);

      // Keep the stored selection if still valid, else default to the first.
      let cur = getCurrentOrgId();
      if (!cur || !list.find((o) => o._id === cur)) {
        cur = list[0]?._id || '';
        if (cur) setStoredOrgId(cur);
      }
      setCurrentOrgIdState(cur);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrgs();
  }, [fetchOrgs]);

  const setCurrentOrgId = useCallback((id: string) => {
    setStoredOrgId(id);
    setCurrentOrgIdState(id);
  }, []);

  const createOrg = useCallback(
    async (name: string): Promise<Org> => {
      const res = await fetch('/api/orgs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create organization');
      await fetchOrgs();
      setCurrentOrgId(data.org._id);
      return data.org;
    },
    [token, fetchOrgs, setCurrentOrgId]
  );

  const currentOrg = orgs.find((o) => o._id === currentOrgId) || null;
  return { orgs, currentOrg, currentOrgId, setCurrentOrgId, createOrg, loading, refetch: fetchOrgs };
}
