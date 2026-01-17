'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import { orgHeaders } from '@/hooks/useOrg';
import type { Template } from '@/types/template';
import styles from '@/styles/Templates.module.css';

export default function CloneTemplateModal({
  template,
  onClose,
}: {
  template: Template;
  onClose: () => void;
}) {
  const router = useRouter();
  const { token } = useAuth();
  const [subdomain, setSubdomain] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await fetch('/api/subdomains', {
        method: 'POST',
        headers: { ...orgHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subdomain: subdomain.trim().toLowerCase(),
          title: template.name,
          description: template.description,
          content: template.content,
          customCss: template.customCss || '',
          // Record which template this page was cloned from.
          metadata: { templateId: template.id, templateName: template.name },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          res.status === 409
            ? `“${subdomain.trim().toLowerCase()}” is already taken — try another name.`
            : data.error || 'Failed to create subdomain'
        );
        setBusy(false);
        return;
      }
      router.push('/subdomains');
    } catch {
      setError('Failed to create subdomain');
      setBusy(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <form
        className={styles.cloneModal}
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <h3>Use “{template.name}”</h3>
        <p className={styles.cloneHint}>Pick a subdomain for your new page.</p>
        <input
          value={subdomain}
          onChange={(e) => setSubdomain(e.target.value)}
          placeholder="my-page"
          pattern="[a-z0-9-]+"
          autoFocus
          required
        />
        {error && <p className={styles.cloneError}>{error}</p>}
        <div className={styles.cloneActions}>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={busy || !subdomain.trim()}>
            {busy ? 'Creating…' : 'Create page'}
          </button>
        </div>
      </form>
    </div>
  );
}
