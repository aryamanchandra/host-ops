'use client';

import { useEffect } from 'react';

/**
 * Fire-and-forget pageview tracker. Rendered (invisible) on the public
 * subdomain page so the page itself can stay a server component while
 * analytics are still recorded client-side.
 */
export default function AnalyticsTracker({ subdomain }: { subdomain: string }) {
  useEffect(() => {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subdomain, path: window.location.pathname }),
    }).catch((err) => console.error('Analytics tracking failed:', err));
  }, [subdomain]);

  return null;
}
