export const REDIRECT_TYPES = [301, 302] as const;
export type RedirectType = (typeof REDIRECT_TYPES)[number];

interface Redirectable {
  type?: 'page' | 'redirect';
  redirectUrl?: string;
}

export function isRedirect(doc: Redirectable): boolean {
  return doc.type === 'redirect' && !!doc.redirectUrl;
}

export function normalizeRedirectType(value: unknown): RedirectType {
  return value === 301 || value === '301' ? 301 : 302;
}

/**
 * Validate redirect config. Returns an error message or null. Includes a
 * loop guard so a subdomain can't redirect to itself.
 */
export function validateRedirect(
  type: string | undefined,
  redirectUrl: string | undefined,
  slug?: string,
  rootDomain?: string
): string | null {
  if (type !== 'redirect') return null;
  if (!redirectUrl) return 'A destination URL is required for redirect subdomains';
  let url: URL;
  try {
    url = new URL(redirectUrl);
  } catch {
    return 'Destination must be a valid absolute URL (https://…)';
  }
  if (slug && rootDomain && url.hostname.toLowerCase() === `${slug}.${rootDomain}`.toLowerCase()) {
    return 'Destination would loop back to this subdomain';
  }
  return null;
}
