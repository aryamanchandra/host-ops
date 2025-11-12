import { UAParser } from 'ua-parser-js';

export interface ParsedUserAgent {
  device: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
}

const UNKNOWN = 'Unknown';

function normalizeBrowser(name?: string): string {
  if (!name) return UNKNOWN;
  if (name.includes('Edge') || name === 'Edg') return 'Edge';
  if (name.includes('Firefox')) return 'Firefox';
  if (name.includes('Chrome') || name.includes('Chromium')) return 'Chrome';
  if (name.includes('Safari')) return 'Safari';
  return name;
}

function normalizeOs(name?: string): string {
  if (!name) return UNKNOWN;
  if (name === 'Mac OS' || name === 'macOS') return 'macOS';
  if (name === 'iOS') return 'iOS';
  if (name === 'Android') return 'Android';
  if (name.startsWith('Windows')) return 'Windows';
  if (name.includes('Linux') || name === 'Ubuntu' || name === 'Debian') return 'Linux';
  return name;
}

function normalizeDevice(type?: string): string {
  if (type === 'mobile') return 'Mobile';
  if (type === 'tablet') return 'Tablet';
  if (type === 'console' || type === 'smarttv' || type === 'wearable') return 'Other';
  return 'Desktop';
}

/**
 * Single source of truth for user-agent classification. Wraps ua-parser-js
 * and normalizes its output to Domainbase's label vocabulary
 * (Desktop/Mobile/Tablet, Chrome/Safari/Firefox/Edge, macOS/iOS/Windows/
 * Linux/Android), plus major browser and OS versions.
 */
export function parseUserAgent(ua?: string): ParsedUserAgent {
  if (!ua) {
    return {
      device: UNKNOWN,
      browser: UNKNOWN,
      browserVersion: UNKNOWN,
      os: UNKNOWN,
      osVersion: UNKNOWN,
    };
  }

  const result = new UAParser(ua).getResult();
  return {
    device: normalizeDevice(result.device.type),
    browser: normalizeBrowser(result.browser.name),
    browserVersion: result.browser.major || result.browser.version || UNKNOWN,
    os: normalizeOs(result.os.name),
    osVersion: result.os.version || UNKNOWN,
  };
}
