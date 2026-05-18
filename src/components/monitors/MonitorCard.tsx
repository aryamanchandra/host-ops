import Link from 'next/link';
import { RefreshCw, Trash2 } from 'lucide-react';
import type { Monitor } from '@/types/monitor';
import { statusColor, statusLabel } from '@/helpers/monitor';
import styles from '@/styles/HealthMonitor.module.css';

export default function MonitorCard({
  monitor,
  onCheck,
  onDelete,
}: {
  monitor: Monitor;
  onCheck: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const days = monitor.lastSsl?.daysLeft;
  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <span className={styles.dot} style={{ background: statusColor(monitor.lastStatus) }} />
        <Link href={`/health/${monitor._id}`} className={styles.host}>
          {monitor.host}
        </Link>
        <span className={styles.status} style={{ color: statusColor(monitor.lastStatus) }}>
          {statusLabel(monitor.lastStatus)}
        </span>
      </div>
      <div className={styles.meta}>
        {monitor.lastResponseMs != null && <span>{monitor.lastResponseMs} ms</span>}
        {typeof days === 'number' && (
          <span className={days <= monitor.certWarnDays ? styles.certWarn : ''}>
            cert {days}d
          </span>
        )}
      </div>
      <div className={styles.cardActions}>
        <button onClick={() => onCheck(monitor._id)} title="Check now">
          <RefreshCw size={14} /> Check
        </button>
        <button onClick={() => onDelete(monitor._id)} title="Delete">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
