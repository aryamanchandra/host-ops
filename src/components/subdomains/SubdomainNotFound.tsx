import { Globe } from 'lucide-react';

/**
 * Vercel-clean empty state for a missing or inactive subdomain.
 * Rendered by the route-level not-found boundary.
 */
export default function SubdomainNotFound({
  message = 'Subdomain not found',
}: {
  message?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        flexDirection: 'column',
        gap: '24px',
        background: '#fafafa',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'white',
          border: '1px solid #eaeaea',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center',
          maxWidth: '480px',
        }}
      >
        <div style={{ marginBottom: '16px', color: '#666' }}>
          <Globe size={48} strokeWidth={1.5} />
        </div>
        <h1
          style={{
            fontSize: '48px',
            fontWeight: 600,
            margin: '0 0 16px',
            color: '#000',
            letterSpacing: '-0.02em',
          }}
        >
          404
        </h1>
        <p style={{ fontSize: '18px', color: '#666', margin: 0 }}>{message}</p>
      </div>
    </div>
  );
}
