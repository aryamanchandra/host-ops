import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getSubdomainBySlug } from '@/lib/subdomains';
import { buildSubdomainMetadata } from '@/helpers/metadata';
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

  return <SubdomainView doc={doc} />;
}
