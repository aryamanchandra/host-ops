import https from 'https';
import tls from 'tls';
import { ObjectId } from 'mongodb';
import { getDb } from './mongodb';
import type { SslInfo, Monitor, MonitorStatus } from './models';

const TIMEOUT_MS = 10000;

export interface HttpProbe {
  statusCode?: number;
  responseTimeMs: number;
  error?: string;
}

/** Probe an HTTPS URL and measure response time. */
export function probeHttp(targetUrl: string, timeoutMs = TIMEOUT_MS): Promise<HttpProbe> {
  return new Promise((resolve) => {
    const start = Date.now();
    try {
      const req = https.get(targetUrl, { timeout: timeoutMs }, (res) => {
        res.resume(); // drain
        resolve({ statusCode: res.statusCode, responseTimeMs: Date.now() - start });
      });
      req.on('timeout', () => {
        req.destroy();
        resolve({ responseTimeMs: Date.now() - start, error: 'timeout' });
      });
      req.on('error', (e) => resolve({ responseTimeMs: Date.now() - start, error: e.message }));
    } catch (e: any) {
      resolve({ responseTimeMs: Date.now() - start, error: e.message });
    }
  });
}

/** Inspect the TLS certificate for a host (issuer + days until expiry). */
export function inspectTls(host: string, timeoutMs = TIMEOUT_MS): Promise<SslInfo | null> {
  return new Promise((resolve) => {
    let settled = false;
    const done = (v: SslInfo | null) => {
      if (!settled) {
        settled = true;
        resolve(v);
      }
    };
    try {
      // Punycode-encode IDN hosts; inspect self-signed certs too (we still
      // want issuer/expiry even when the chain doesn't validate).
      const asciiHost = (() => {
        try {
          return new URL(`https://${host}`).hostname;
        } catch {
          return host;
        }
      })();
      const socket = tls.connect(
        {
          host: asciiHost,
          port: 443,
          servername: asciiHost,
          timeout: timeoutMs,
          rejectUnauthorized: false,
        },
        () => {
          const cert = socket.getPeerCertificate();
          if (!cert || !cert.valid_to) {
            socket.end();
            done(null);
            return;
          }
          const validTo = new Date(cert.valid_to);
          const daysLeft = Math.round((validTo.getTime() - Date.now()) / 86400000);
          const issuer =
            (cert.issuer && ((cert.issuer as any).O || (cert.issuer as any).CN)) || undefined;
          const authorized = socket.authorized;
          socket.end();
          done({ issuer, validTo: validTo.toISOString(), daysLeft, valid: authorized });
        }
      );
      socket.on('timeout', () => {
        socket.destroy();
        done(null);
      });
      socket.on('error', () => done(null));
    } catch {
      done(null);
    }
  });
}

let indexesEnsured = false;
export async function ensureMonitorIndexes(): Promise<void> {
  if (indexesEnsured) return;
  const db = await getDb();
  await db.collection('monitors').createIndex({ userId: 1 });
  await db.collection('monitors').createIndex({ userId: 1, host: 1 }, { unique: true });
  await db.collection('monitors').createIndex({ isActive: 1, lastCheckedAt: 1 });
  await db.collection('monitor_checks').createIndex({ monitorId: 1, checkedAt: -1 });
  indexesEnsured = true;
}

function deriveStatus(probe: HttpProbe): MonitorStatus {
  if (probe.error) return 'down';
  const code = probe.statusCode || 0;
  if (code >= 200 && code < 400) return probe.responseTimeMs > 3000 ? 'degraded' : 'up';
  if (code >= 400 && code < 500) return 'degraded';
  return 'down';
}

export interface CheckResult {
  status: MonitorStatus;
  prevStatus: MonitorStatus;
  ssl: SslInfo | null;
  probe: HttpProbe;
}

/** Run a check for a monitor, persist history, and update its last status. */
export async function runCheck(monitor: Monitor): Promise<CheckResult> {
  const probe = await probeHttp(monitor.targetUrl);
  const ssl = await inspectTls(monitor.host);
  const status = deriveStatus(probe);
  const db = await getDb();
  const checkedAt = new Date();

  await db.collection('monitor_checks').insertOne({
    monitorId: String(monitor._id),
    host: monitor.host,
    statusCode: probe.statusCode,
    responseTimeMs: probe.responseTimeMs,
    status,
    ssl,
    error: probe.error,
    checkedAt,
  } as any);

  await db.collection('monitors').updateOne(
    { _id: new ObjectId(String(monitor._id)) },
    {
      $set: {
        lastStatus: status,
        lastCheckedAt: checkedAt,
        lastResponseMs: probe.responseTimeMs,
        lastSsl: ssl || undefined,
        updatedAt: checkedAt,
      },
    }
  );

  await dispatchAlerts(monitor, status, monitor.lastStatus, ssl);
  return { status, prevStatus: monitor.lastStatus, ssl, probe };
}

async function notify(subject: string, text: string): Promise<'email' | 'log' | 'none'> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ALERT_EMAIL;
  if (!key || !to) {
    console.log('[monitor alert]', subject, '-', text);
    return 'log';
  }
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(key);
    await resend.emails.send({
      from: process.env.ALERT_FROM || 'alerts@domainbase.app',
      to,
      subject,
      text,
    });
    return 'email';
  } catch {
    return 'none';
  }
}

/** Raise alerts on down/recovered transitions and expiring certificates. */
export async function dispatchAlerts(
  monitor: Monitor,
  status: MonitorStatus,
  prevStatus: MonitorStatus,
  ssl: SslInfo | null
): Promise<void> {
  const pending: Array<{ type: 'down' | 'recovered' | 'cert-expiring'; message: string; certDaysLeft?: number }> = [];

  if (status === 'down' && prevStatus !== 'down') {
    pending.push({ type: 'down', message: `${monitor.host} is down` });
  }
  if (status === 'up' && (prevStatus === 'down' || prevStatus === 'degraded')) {
    pending.push({ type: 'recovered', message: `${monitor.host} has recovered` });
  }
  if (ssl && typeof ssl.daysLeft === 'number' && ssl.daysLeft <= (monitor.certWarnDays || 14)) {
    pending.push({
      type: 'cert-expiring',
      message: `${monitor.host} TLS certificate expires in ${ssl.daysLeft} day(s)`,
      certDaysLeft: ssl.daysLeft,
    });
  }
  if (!pending.length) return;

  const db = await getDb();
  for (const a of pending) {
    const notifiedVia = await notify(`[Domainbase] ${a.message}`, a.message);
    await db.collection('monitor_alerts').insertOne({
      monitorId: String(monitor._id),
      userId: monitor.userId,
      type: a.type,
      message: a.message,
      certDaysLeft: a.certDaysLeft,
      createdAt: new Date(),
      notifiedVia,
    } as any);
  }
}
