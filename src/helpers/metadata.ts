import type { Metadata } from 'next';
import { Subdomain } from '@/lib/models';

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || '';

/**
 * Map a subdomain document into a Next.js Metadata object for SSR <head>
 * tags: title/description, canonical URL, robots, and OpenGraph + Twitter
 * cards. Canonical defaults to https://{slug}.{root-domain}.
 */
export function buildSubdomainMetadata(doc: Subdomain, slug: string): Metadata {
  const canonical =
    doc.metadata?.canonicalUrl ||
    (ROOT_DOMAIN ? `https://${slug}.${ROOT_DOMAIN}` : undefined);
  const ogImage = doc.metadata?.ogImage;
  const description = doc.description || undefined;
  // Inactive subdomains and those explicitly flagged should not be indexed.
  const noindex = doc.metadata?.noindex === true || doc.isActive === false;

  return {
    title: doc.title,
    description,
    alternates: canonical ? { canonical } : undefined,
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: doc.title,
      description,
      url: canonical,
      type: 'website',
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title: doc.title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}
