import { useState, useEffect, useCallback } from 'react';
import type { FormSchema } from '@/types/form';
import { orgHeaders } from './useOrg';

export function useFormSchema(token: string, subdomain: string) {
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!token || !subdomain) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/subdomains/${subdomain}/form`, {
        headers: orgHeaders(token),
      });
      if (r.ok) setSchema((await r.json()).form);
    } finally {
      setLoading(false);
    }
  }, [token, subdomain]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (s: FormSchema) => {
    const r = await fetch(`/api/subdomains/${subdomain}/form`, {
      method: 'PUT',
      headers: { ...orgHeaders(token), 'Content-Type': 'application/json' },
      body: JSON.stringify(s),
    });
    if (!r.ok) throw new Error('Failed to save form');
    setSchema(s);
  };

  return { schema, loading, save, reload: load };
}
