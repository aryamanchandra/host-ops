export interface UtmParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}

/**
 * Extract utm_* tags from a landing URL (full URL or bare query string).
 */
export function parseUtmParams(landingUrl?: string): UtmParams {
  if (!landingUrl) return {};

  let qs: URLSearchParams;
  try {
    qs = new URL(landingUrl, 'http://placeholder').searchParams;
  } catch {
    const idx = landingUrl.indexOf('?');
    qs = new URLSearchParams(idx >= 0 ? landingUrl.slice(idx + 1) : landingUrl);
  }

  // Cap each value to a sane length and drop empties so undefined utm
  // params are never persisted.
  const get = (key: string): string | undefined => {
    const v = qs.get(key);
    return v ? v.slice(0, 200) : undefined;
  };

  return {
    utmSource: get('utm_source'),
    utmMedium: get('utm_medium'),
    utmCampaign: get('utm_campaign'),
    utmTerm: get('utm_term'),
    utmContent: get('utm_content'),
  };
}

/**
 * Infer a coarse traffic source (hostname) from the referer when no
 * explicit utm_source is present.
 */
export function inferSource(referer?: string): string | undefined {
  if (!referer) return undefined;
  try {
    const host = new URL(referer).hostname.replace(/^www\./, '');
    return host || undefined;
  } catch {
    return undefined;
  }
}
