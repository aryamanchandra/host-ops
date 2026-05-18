import { useState, useEffect, useCallback } from 'react';
import type { Monitor, MonitorCheck } from '@/types/monitor';
import { orgHeaders } from './useOrg';

export function useMonitors(token: string) {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const r = await fetch('/api/monitors', { headers: orgHeaders(token) });
      if (r.ok) setMonitors((await r.json()).monitors || []);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (data: { host: string; targetUrl?: string }) => {
    const r = await fetch('/api/monitors', {
      method: 'POST',
      headers: { ...orgHeaders(token), 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const res = await r.json();
    if (!r.ok) throw new Error(res.error || 'Failed to create monitor');
    await load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/monitors/${id}`, { method: 'DELETE', headers: orgHeaders(token) });
    await load();
  };

  const check = async (id: string) => {
    await fetch(`/api/monitors/${id}/check`, { method: 'POST', headers: orgHeaders(token) });
    await load();
  };

  return { monitors, loading, create, remove, check, reload: load };
}

export function useMonitorDetail(token: string, id: string) {
  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const [checks, setChecks] = useState<MonitorCheck[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);
    try {
      const [mRes, cRes] = await Promise.all([
        fetch(`/api/monitors/${id}`, { headers: orgHeaders(token) }),
        fetch(`/api/monitors/${id}/checks`, { headers: orgHeaders(token) }),
      ]);
      if (mRes.ok) setMonitor((await mRes.json()).monitor);
      if (cRes.ok) setChecks((await cRes.json()).checks || []);
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => {
    load();
  }, [load]);

  return { monitor, checks, loading, reload: load };
}
