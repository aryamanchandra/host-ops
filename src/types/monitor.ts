export type MonitorStatus = 'up' | 'down' | 'degraded' | 'unknown';

export interface SslInfo {
  issuer?: string;
  validTo?: string;
  daysLeft?: number;
  valid?: boolean;
}

export interface Monitor {
  _id: string;
  subdomain?: string;
  host: string;
  targetUrl: string;
  intervalMinutes: number;
  certWarnDays: number;
  isActive: boolean;
  lastStatus: MonitorStatus;
  lastCheckedAt?: string;
  lastResponseMs?: number;
  lastSsl?: SslInfo;
}

export interface MonitorCheck {
  _id: string;
  monitorId: string;
  statusCode?: number;
  responseTimeMs?: number;
  status: MonitorStatus;
  ssl?: SslInfo | null;
  error?: string;
  checkedAt: string;
}
