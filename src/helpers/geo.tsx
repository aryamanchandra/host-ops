/**
 * Client-safe geo UI helpers (no server / geoip-lite imports).
 */

/** Convert an ISO-2 country code to its flag emoji via regional indicators. */
export function countryCodeToFlag(code: string): string {
  if (!code || code.length !== 2) return '🌐';
  const BASE = 0x1f1e6;
  const cc = code.toUpperCase();
  return String.fromCodePoint(
    BASE + (cc.charCodeAt(0) - 65),
    BASE + (cc.charCodeAt(1) - 65)
  );
}

/** Map a normalized 0..1 ratio to a fill between light grey and Vercel blue. */
export function colorScale(ratio: number): string {
  const t = Math.max(0, Math.min(1, ratio));
  const from = [245, 245, 245];
  const to = [0, 112, 243];
  const ch = from.map((f, i) => Math.round(f + (to[i] - f) * t));
  return `rgb(${ch[0]}, ${ch[1]}, ${ch[2]})`;
}
