import { useEffect, useRef, useState } from 'react';
import type { LiveAnalytics } from '@/types/live';

const POLL_INTERVAL_MS = 7000;

/**
 * Subscribe to the live analytics SSE stream for a subdomain. Reconnects
 * with exponential backoff, pauses while the tab is hidden, and falls back
 * to JSON polling when EventSource is unavailable.
 */
export function useLiveAnalytics(subdomain: string, token: string) {
  const [live, setLive] = useState<LiveAnalytics | null>(null);
  const [connected, setConnected] = useState(false);
  const retryRef = useRef(0);

  useEffect(() => {
    if (!subdomain || !token) return;

    let es: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let pollTimer: ReturnType<typeof setInterval>;
    let stopped = false;

    const base = `/api/analytics/${subdomain}/live?token=${encodeURIComponent(token)}`;
    const supportsSse = typeof EventSource !== 'undefined';

    const poll = async () => {
      try {
        const res = await fetch(`${base}&poll=1`);
        if (res.ok) {
          setLive(await res.json());
          setConnected(true);
        }
      } catch {
        setConnected(false);
      }
    };

    const startPolling = () => {
      poll();
      pollTimer = setInterval(poll, POLL_INTERVAL_MS);
    };

    const connect = () => {
      if (stopped) return;
      es = new EventSource(base);
      es.onopen = () => {
        setConnected(true);
        retryRef.current = 0;
      };
      es.onmessage = (e) => {
        try {
          setLive(JSON.parse(e.data));
        } catch {
          // ignore malformed frame
        }
      };
      es.onerror = () => {
        setConnected(false);
        es?.close();
        const delay = Math.min(30000, 1000 * 2 ** retryRef.current);
        retryRef.current += 1;
        reconnectTimer = setTimeout(connect, delay);
      };
    };

    const stop = () => {
      es?.close();
      es = null;
      clearTimeout(reconnectTimer);
      clearInterval(pollTimer);
      setConnected(false);
    };

    const start = () => {
      if (supportsSse) connect();
      else startPolling();
    };

    const onVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        stopped = false;
        start();
      }
    };

    start();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stopped = true;
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [subdomain, token]);

  return { live, connected };
}
