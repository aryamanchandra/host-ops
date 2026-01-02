'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Building2 } from 'lucide-react';
import { setStoredOrgId } from '@/hooks/useOrg';

interface Preview {
  email: string;
  role: string;
  orgName: string;
}

export default function InvitePage() {
  const { token: inviteToken } = useParams() as { token: string };
  const router = useRouter();
  const [preview, setPreview] = useState<Preview | null>(null);
  const [status, setStatus] = useState<
    'loading' | 'ready' | 'error' | 'accepting' | 'done'
  >('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/invites/${inviteToken}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Invite not found');
          setStatus('error');
          return;
        }
        if (data.expired) {
          setError('This invite has expired');
          setStatus('error');
          return;
        }
        setPreview(data);
        setStatus('ready');
      } catch {
        setError('Failed to load invite');
        setStatus('error');
      }
    })();
  }, [inviteToken]);

  const accept = async () => {
    const authToken =
      typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
    if (!authToken) {
      // Send to login, returning here afterwards.
      router.push(`/?invite=${inviteToken}`);
      return;
    }
    setStatus('accepting');
    try {
      const res = await fetch(`/api/invites/${inviteToken}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to accept invite');
        setStatus('error');
        return;
      }
      setStoredOrgId(data.orgId);
      setStatus('done');
      setTimeout(() => router.push('/subdomains'), 800);
    } catch {
      setError('Failed to accept invite');
      setStatus('error');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fafafa',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: 20,
      }}
    >
      <div
        style={{
          background: '#fff',
          border: '1px solid #eaeaea',
          borderRadius: 12,
          padding: 40,
          maxWidth: 420,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <div style={{ color: '#666', marginBottom: 16 }}>
          <Building2 size={40} strokeWidth={1.5} />
        </div>

        {status === 'loading' && <p style={{ color: '#666' }}>Loading invite…</p>}

        {status === 'error' && (
          <>
            <h1 style={{ fontSize: 22, margin: '0 0 8px' }}>Invite unavailable</h1>
            <p style={{ color: '#666' }}>{error}</p>
          </>
        )}

        {(status === 'ready' || status === 'accepting') && preview && (
          <>
            <h1 style={{ fontSize: 22, margin: '0 0 8px', letterSpacing: '-0.01em' }}>
              Join {preview.orgName || 'this organization'}
            </h1>
            <p style={{ color: '#666', margin: '0 0 24px' }}>
              You were invited as <strong>{preview.role}</strong>.
            </p>
            <button
              onClick={accept}
              disabled={status === 'accepting'}
              style={{
                background: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                width: '100%',
              }}
            >
              {status === 'accepting' ? 'Joining…' : 'Accept invite'}
            </button>
          </>
        )}

        {status === 'done' && (
          <>
            <h1 style={{ fontSize: 22, margin: '0 0 8px' }}>You're in 🎉</h1>
            <p style={{ color: '#666' }}>Redirecting to your dashboard…</p>
          </>
        )}
      </div>
    </div>
  );
}
