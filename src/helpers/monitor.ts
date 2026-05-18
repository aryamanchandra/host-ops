import type { MonitorStatus } from '@/types/monitor';

export function statusColor(s: MonitorStatus): string {
  return s === 'up'
    ? '#06ce6b'
    : s === 'degraded'
    ? '#f59e0b'
    : s === 'down'
    ? '#e11d48'
    : '#999';
}

export function statusLabel(s: MonitorStatus): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
