'use client';

import { useState } from 'react';
import { useAuth, useSubdomains, useLiveVisitors } from '@/hooks';
import LiveVisitorMap from '@/components/analytics/LiveVisitorMap';
import LiveCountryList from '@/components/analytics/LiveCountryList';
import styles from '@/styles/LiveMap.module.css';

export default function LiveMapPage() {
  const { token } = useAuth();
  const { subdomains } = useSubdomains(token);
  const [sub, setSub] = useState('');
  const { data, newIds } = useLiveVisitors(token, sub || undefined);

  const pings = data?.pings || [];
  const countries = data?.countries || [];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Live Map</h1>
          <p className={styles.sub}>
            <span className={styles.liveDot} /> {pings.length} visitors in the last 10 minutes
          </p>
        </div>
        <select value={sub} onChange={(e) => setSub(e.target.value)} className={styles.filter}>
          <option value="">All subdomains</option>
          {subdomains.map((s) => (
            <option key={s._id} value={s.subdomain}>
              {s.subdomain}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.layout}>
        <LiveVisitorMap pings={pings} newIds={newIds} />
        <LiveCountryList countries={countries} />
      </div>
    </div>
  );
}
