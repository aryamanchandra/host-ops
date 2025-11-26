import geoip from 'geoip-lite';

export interface GeoResult {
  country: string; // display name, e.g. "United States"
  countryCode: string; // ISO-2, e.g. "US"
  region: string;
  city: string;
}

// Compact ISO-2 -> display-name map for the countries most commonly seen in
// analytics; unmapped codes fall back to the raw code.
const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States', GB: 'United Kingdom', CA: 'Canada', AU: 'Australia',
  DE: 'Germany', FR: 'France', IN: 'India', JP: 'Japan', CN: 'China',
  BR: 'Brazil', RU: 'Russia', IT: 'Italy', ES: 'Spain', NL: 'Netherlands',
  SE: 'Sweden', NO: 'Norway', DK: 'Denmark', FI: 'Finland', PL: 'Poland',
  IE: 'Ireland', CH: 'Switzerland', AT: 'Austria', BE: 'Belgium', PT: 'Portugal',
  MX: 'Mexico', AR: 'Argentina', CL: 'Chile', CO: 'Colombia', ZA: 'South Africa',
  NG: 'Nigeria', EG: 'Egypt', KE: 'Kenya', AE: 'United Arab Emirates',
  SA: 'Saudi Arabia', IL: 'Israel', TR: 'Turkey', GR: 'Greece', UA: 'Ukraine',
  SG: 'Singapore', MY: 'Malaysia', ID: 'Indonesia', TH: 'Thailand', VN: 'Vietnam',
  PH: 'Philippines', KR: 'South Korea', TW: 'Taiwan', HK: 'Hong Kong',
  NZ: 'New Zealand', PK: 'Pakistan', BD: 'Bangladesh', LK: 'Sri Lanka',
  CZ: 'Czechia', RO: 'Romania', HU: 'Hungary', BG: 'Bulgaria', HR: 'Croatia',
};

export function countryName(code: string): string {
  return COUNTRY_NAMES[code] || code;
}

/**
 * Normalize a forwarded IP value: take the first hop of a comma-separated
 * x-forwarded-for chain (the original client), strip the IPv6-mapped IPv4
 * prefix, and trim whitespace.
 */
export function normalizeIp(ip?: string): string {
  if (!ip) return '';
  let value = ip.split(',')[0].trim();
  if (value.startsWith('::ffff:')) value = value.slice('::ffff:'.length);
  return value;
}

function isPrivateOrLocal(ip: string): boolean {
  if (!ip || ip === 'unknown' || ip === '::1' || ip === '127.0.0.1') return true;
  if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('127.')) return true;
  if (ip.startsWith('fc') || ip.startsWith('fd') || ip.startsWith('fe80')) return true;
  const m = ip.match(/^172\.(\d+)\./);
  if (m) {
    const second = Number(m[1]);
    if (second >= 16 && second <= 31) return true;
  }
  return false;
}

const cache = new Map<string, GeoResult | null>();
const MAX_CACHE = 5000;

/**
 * Resolve an IP to coarse geo (country/region/city) via geoip-lite.
 * Returns null for private/loopback/unresolved IPs. Results are memoized
 * per IP to avoid repeat lookups under bursty traffic.
 */
export function lookupGeo(ip?: string): GeoResult | null {
  const norm = normalizeIp(ip);
  if (!norm || isPrivateOrLocal(norm)) return null;

  if (cache.has(norm)) return cache.get(norm)!;

  const hit = geoip.lookup(norm);
  const result: GeoResult | null = hit
    ? {
        country: countryName(hit.country),
        countryCode: hit.country,
        region: hit.region || '',
        city: hit.city || '',
      }
    : null;

  if (cache.size > MAX_CACHE) cache.clear();
  cache.set(norm, result);
  return result;
}
