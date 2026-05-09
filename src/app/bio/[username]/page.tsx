'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { BioProfile } from '@/types/bio';

export default function PublicBioPage() {
  const { username } = useParams() as { username: string };
  const [p, setP] = useState<BioProfile | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/bio/${username}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setP(d.profile))
      .catch(() => setNotFound(true));
  }, [username]);

  const wrap: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    background: '#fafafa',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '60px 20px',
  };

  if (notFound) {
    return (
      <div style={wrap}>
        <p style={{ color: '#666' }}>This profile doesn’t exist.</p>
      </div>
    );
  }
  if (!p) {
    return (
      <div style={wrap}>
        <p style={{ color: '#666' }}>Loading…</p>
      </div>
    );
  }

  const accent = p.accentColor || '#0070f3';

  return (
    <div style={wrap}>
      <div style={{ width: '100%', maxWidth: 460, textAlign: 'center' }}>
        {p.avatar && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.avatar}
            alt={p.displayName}
            width={88}
            height={88}
            style={{ borderRadius: '50%', objectFit: 'cover', margin: '0 auto 16px' }}
          />
        )}
        <h1 style={{ fontSize: 24, margin: '0 0 6px' }}>{p.displayName}</h1>
        {p.bio && <p style={{ color: '#666', margin: '0 0 28px' }}>{p.bio}</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {p.links.map((l, i) => (
            <a
              key={i}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                padding: '14px 16px',
                borderRadius: 12,
                background: '#fff',
                border: `1px solid ${accent}33`,
                color: '#111',
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              {l.label || l.url}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
