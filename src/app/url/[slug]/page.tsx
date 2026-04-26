'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type State = 'loading' | 'password' | 'expired' | 'notfound';

export default function ShortLinkRedirect() {
  const params = useParams();
  const slug = params.slug as string;
  const [state, setState] = useState<State>('loading');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/links/redirect/${slug}`);
        if (res.status === 410) {
          setState('expired');
          return;
        }
        if (!res.ok) {
          setState('notfound');
          return;
        }
        const data = await res.json();
        if (data.requiresPassword) {
          setState('password');
          return;
        }
        window.location.href = data.targetUrl;
      } catch {
        setState('notfound');
      }
    })();
  }, [slug]);

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch(`/api/links/redirect/${slug}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Incorrect password');
      return;
    }
    window.location.href = data.targetUrl;
  };

  const wrap: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: '#fafafa',
  };

  if (state === 'password') {
    return (
      <div style={wrap}>
        <form
          onSubmit={submitPassword}
          style={{
            background: '#fff',
            border: '1px solid #eaeaea',
            borderRadius: 12,
            padding: 32,
            width: 320,
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>Password required</h2>
          <p style={{ color: '#666', fontSize: 14, margin: '0 0 16px' }}>
            This link is protected.
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #eaeaea',
              borderRadius: 8,
              boxSizing: 'border-box',
            }}
          />
          {error && <p style={{ color: '#e11d48', fontSize: 13 }}>{error}</p>}
          <button
            type="submit"
            style={{
              marginTop: 12,
              width: '100%',
              padding: 10,
              background: '#000',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Continue
          </button>
        </form>
      </div>
    );
  }

  if (state === 'expired' || state === 'notfound') {
    return (
      <div style={wrap}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <h1 style={{ fontSize: 48, margin: '0 0 8px' }}>
            {state === 'expired' ? '410' : '404'}
          </h1>
          <p style={{ color: '#666' }}>
            {state === 'expired' ? 'This link has expired.' : 'Link not found.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div
          style={{
            width: 40,
            height: 40,
            border: '3px solid #eaeaea',
            borderTop: '3px solid #000',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }}
        />
        <p style={{ color: '#666', fontSize: 14 }}>Redirecting…</p>
        <style
          dangerouslySetInnerHTML={{
            __html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`,
          }}
        />
      </div>
    </div>
  );
}
