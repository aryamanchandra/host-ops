import { Subdomain } from '@/lib/models';
import SubdomainContent from './SubdomainContent';
import AnalyticsTracker from './AnalyticsTracker';

/**
 * Server wrapper that renders a page-type subdomain's content plus the
 * client-side analytics tracker. Keeps page.tsx thin so it can focus on
 * data-loading and the page-vs-redirect decision.
 */
export default function SubdomainView({ doc }: { doc: Subdomain }) {
  return (
    <>
      <SubdomainContent doc={doc} />
      <AnalyticsTracker subdomain={doc.subdomain} />
    </>
  );
}
