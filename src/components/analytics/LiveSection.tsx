'use client';

import { Activity } from 'lucide-react';
import { useLiveAnalytics } from '@/hooks/useLiveAnalytics';
import { countryCodeToFlag } from '@/helpers/geo';
import styles from '@/styles/LiveAnalytics.module.css';

function relativeTime(iso: string): string {
  const secs = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.round(secs / 60);
  return `${mins}m ago`;
}

export default function LiveSection({
  subdomain,
  token,
}: {
  subdomain: string;
  token: string;
}) {
  const { live, connected } = useLiveAnalytics(subdomain, token);
  const active = live?.activeVisitors ?? 0;
  const events = live?.recentEvents ?? [];

  return (
    <div className={styles.liveCard}>
      <div className={styles.liveHeader}>
        <span className={styles.liveLabel}>
          <span
            className={`${styles.dot} ${connected ? styles.dotLive : styles.dotIdle}`}
          />
          Live
        </span>
        <span className={styles.activeCount}>
          <Activity size={15} />
          {active} active visitor{active === 1 ? '' : 's'}
        </span>
      </div>

      <div className={styles.feed}>
        {events.length === 0 ? (
          <p className={styles.empty}>No activity in the last few minutes</p>
        ) : (
          events.map((e, i) => (
            <div key={i} className={styles.event}>
              <span className={styles.eventFlag}>
                {e.countryCode ? countryCodeToFlag(e.countryCode) : '🌐'}
              </span>
              <span className={styles.eventPath}>{e.path}</span>
              <span className={styles.eventMeta}>
                {[e.device, e.browser].filter(Boolean).join(' · ')}
              </span>
              <span className={styles.eventTime}>{relativeTime(e.timestamp)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
