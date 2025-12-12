import { useEffect, useRef, useState } from 'react';
import type { LiveAnalytics } from '@/types/live';

/**
 * Subscribe to the live analytics SSE stream for a subdomain. Reconnects
 * with exponential backoff on transient errors.
 */
export function useLiveAnalytics(subdomain: string, token: string) {
  const [live, setLive] = useState<LiveAnalytics | null>(null);
  const [connected, setConnected] = useState(false);
  const retryRef = useRef(0);

  useEffect(() => {
    if (!subdomain || !token) return;

    let es: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    const connect = () => {
      es = new EventSource(
        `/api/analytics/${subdomain}/live?token=${encodeURIComponent(token)}`
      );
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

    connect();
  }, [subdomain, token]);

  return { live, connected };
}
