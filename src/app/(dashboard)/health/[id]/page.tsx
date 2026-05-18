'use client';

import { useParams } from 'next/navigation';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuth, useMonitorDetail } from '@/hooks';
import { statusColor, statusLabel } from '@/helpers/monitor';
import styles from '@/styles/HealthMonitor.module.css';

export default function MonitorDetailPage() {
  const { id } = useParams() as { id: string };
  const { token } = useAuth();
  const { monitor, checks, loading } = useMonitorDetail(token, id);

  if (loading || !monitor) {
    return (
      <div className={styles.page}>
        <p className={styles.muted}>Loading…</p>
      </div>
    );
  }

  const chartData = [...checks]
    .reverse()
    .map((c) => ({ t: new Date(c.checkedAt).toLocaleTimeString(), ms: c.responseTimeMs || 0 }));

  return (
    <div className={styles.page}>
      <div className={styles.detailHead}>
        <span className={styles.dot} style={{ background: statusColor(monitor.lastStatus) }} />
        <h1 className={styles.title}>{monitor.host}</h1>
        <span className={styles.status} style={{ color: statusColor(monitor.lastStatus) }}>
          {statusLabel(monitor.lastStatus)}
        </span>
      </div>

      <div className={styles.panels}>
        <div className={styles.panel}>
          <h3>Response time</h3>
          {chartData.length === 0 ? (
            <p className={styles.muted}>No checks yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <XAxis dataKey="t" tick={{ fontSize: 11 }} hide />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="ms" stroke="#0070f3" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className={styles.panel}>
          <h3>SSL certificate</h3>
          {monitor.lastSsl ? (
            <ul className={styles.sslList}>
              <li>Issuer: {monitor.lastSsl.issuer || '—'}</li>
              <li>Valid: {monitor.lastSsl.valid ? 'Yes' : 'No'}</li>
              <li>
                Expires in:{' '}
                <strong className={(monitor.lastSsl.daysLeft ?? 99) <= monitor.certWarnDays ? styles.certWarn : ''}>
                  {monitor.lastSsl.daysLeft ?? '—'} days
                </strong>
              </li>
            </ul>
          ) : (
            <p className={styles.muted}>No certificate data.</p>
          )}
        </div>
      </div>

      <h3 className={styles.sectionTitle}>Recent checks</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Time</th>
            <th>Status</th>
            <th>Code</th>
            <th>Response</th>
          </tr>
        </thead>
        <tbody>
          {checks.map((c) => (
            <tr key={c._id}>
              <td>{new Date(c.checkedAt).toLocaleString()}</td>
              <td style={{ color: statusColor(c.status) }}>{statusLabel(c.status)}</td>
              <td>{c.statusCode ?? (c.error || '—')}</td>
              <td>{c.responseTimeMs != null ? `${c.responseTimeMs} ms` : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
