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
    try {
      const socket = tls.connect(
        { host, port: 443, servername: host, timeout: timeoutMs },
        () => {
          const cert = socket.getPeerCertificate();
          if (!cert || !cert.valid_to) {
            socket.end();
            resolve(null);
            return;
          }
          const validTo = new Date(cert.valid_to);
          const daysLeft = Math.round((validTo.getTime() - Date.now()) / 86400000);
          const issuer =
            (cert.issuer && ((cert.issuer as any).O || (cert.issuer as any).CN)) || undefined;
          const authorized = socket.authorized;
          socket.end();
          resolve({ issuer, validTo: validTo.toISOString(), daysLeft, valid: authorized });
        }
      );
      socket.on('timeout', () => {
        socket.destroy();
        resolve(null);
      });
      socket.on('error', () => resolve(null));
    } catch {
      resolve(null);
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

  return { status, prevStatus: monitor.lastStatus, ssl, probe };
}
