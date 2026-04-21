import QRCode from 'qrcode';

export interface Utm {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

/** Generate a PNG data URL QR code for the given text. */
export async function generateQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, { margin: 1, width: 240 });
}

/** Append utm_* params to a base URL. */
export function buildUtmUrl(base: string, utm: Utm): string {
  try {
    const u = new URL(base);
    const map: Record<string, string | undefined> = {
      utm_source: utm.source,
      utm_medium: utm.medium,
      utm_campaign: utm.campaign,
      utm_term: utm.term,
      utm_content: utm.content,
    };
    for (const [k, v] of Object.entries(map)) {
      if (v) u.searchParams.set(k, v);
    }
    return u.toString();
  } catch {
    return base;
  }
}

/** True if a link's expiry timestamp is in the past. */
export function isExpired(expiresAt?: Date | string | null): boolean {
  if (!expiresAt) return false;
  const d = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  return !isNaN(d.getTime()) && d.getTime() <= Date.now();
}
