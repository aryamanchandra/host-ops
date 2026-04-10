import { Subdomain } from '@/lib/models';
import SubdomainContent from './SubdomainContent';
import AnalyticsTracker from './AnalyticsTracker';
import PublicContactForm from './PublicContactForm';

/**
 * Server wrapper that renders a page-type subdomain's content plus the
 * client-side analytics tracker. Keeps page.tsx thin so it can focus on
 * data-loading and the page-vs-redirect decision.
 */
export default function SubdomainView({ doc }: { doc: Subdomain }) {
  return (
    <>
      <SubdomainContent doc={doc} />
      {doc.form?.enabled && (
        <div style={{ maxWidth: 640, margin: '0 auto 60px', padding: '0 20px' }}>
          <PublicContactForm subdomain={doc.subdomain} form={doc.form} />
        </div>
      )}
      <AnalyticsTracker subdomain={doc.subdomain} />
    </>
  );
}
