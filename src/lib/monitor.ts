import https from 'https';
import tls from 'tls';
import type { SslInfo } from './models';

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
