import { useState, useEffect, useRef } from 'react';
import type { LiveVisitors } from '@/types/livemap';
import { orgHeaders } from './useOrg';

const POLL_MS = 8000;

export function useLiveVisitors(token: string, subdomain?: string) {
  const [data, setData] = useState<LiveVisitors | null>(null);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const seen = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!token) return;
    let timer: ReturnType<typeof setInterval>;

    const poll = async () => {
      try {
        const url = `/api/analytics/live${
          subdomain ? `?subdomain=${encodeURIComponent(subdomain)}` : ''
        }`;
        const r = await fetch(url, { headers: orgHeaders(token) });
        if (!r.ok) return;
        const d: LiveVisitors = await r.json();
        const fresh = d.pings.filter((p) => !seen.current.has(p.id)).map((p) => p.id);
        fresh.forEach((id) => seen.current.add(id));
        setNewIds(new Set(fresh));
        setData(d);
      } catch {
        // transient — retry next tick
      }
    };

    poll();
    timer = setInterval(poll, POLL_MS);
    return () => clearInterval(timer);
  }, [token, subdomain]);

  return { data, newIds };
}
