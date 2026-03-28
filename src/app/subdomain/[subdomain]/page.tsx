import { notFound, redirect, permanentRedirect } from 'next/navigation';
import { headers } from 'next/headers';
import type { Metadata } from 'next';
import { getSubdomainBySlug } from '@/lib/subdomains';
import { buildSubdomainMetadata } from '@/helpers/metadata';
import { isRedirect } from '@/lib/redirect';
import { trackPageView } from '@/lib/analytics';
import SubdomainView from '@/components/subdomains/SubdomainView';

// Render per-request so freshly edited subdomains reflect immediately
// without a redeploy or cache revalidation window.
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { subdomain: string };
}): Promise<Metadata> {
  const doc = await getSubdomainBySlug(params.subdomain);
  if (!doc) {
    return { title: 'Not found', robots: { index: false, follow: false } };
  }
  return buildSubdomainMetadata(doc, params.subdomain);
}

export default async function SubdomainPage({
  params,
}: {
  params: { subdomain: string };
}) {
  const doc = await getSubdomainBySlug(params.subdomain);

  if (!doc || !doc.isActive) {
    notFound();
  }

  // Redirect-type subdomains bounce to their destination (301 or 302).
  if (isRedirect(doc) && doc.redirectUrl) {
    // Record the hit before bouncing so redirect traffic still shows up.
    const h = headers();
    await trackPageView({
      subdomain: doc.subdomain,
      path: '/',
      ip: h.get('x-forwarded-for') || h.get('x-real-ip') || undefined,
      userAgent: h.get('user-agent') || undefined,
      referer: h.get('referer') || undefined,
    }).catch(() => {});
    if (doc.redirectType === 301) permanentRedirect(doc.redirectUrl);
    redirect(doc.redirectUrl);
  }

  return <SubdomainView doc={doc} />;
}
