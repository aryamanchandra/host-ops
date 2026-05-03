import { useState, useEffect, useCallback } from 'react';
import type { BioProfile } from '@/types/bio';
import { orgHeaders } from './useOrg';

export function useBioProfile(token: string) {
  const [profile, setProfile] = useState<BioProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const r = await fetch('/api/bio', { headers: orgHeaders(token) });
      if (r.ok) setProfile((await r.json()).profile);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (data: BioProfile) => {
    const r = await fetch('/api/bio', {
      method: 'PUT',
      headers: { ...orgHeaders(token), 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const res = await r.json();
    if (!r.ok) throw new Error(res.error || 'Failed to save');
    await load();
  };

  return { profile, loading, save };
}
