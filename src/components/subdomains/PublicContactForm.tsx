'use client';

import { useState, useRef } from 'react';
import type { FormSchema } from '@/types/form';
import styles from '@/styles/Forms.module.css';

export default function PublicContactForm({
  subdomain,
  form,
}: {
  subdomain: string;
  form: FormSchema;
}) {
  const [data, setData] = useState<Record<string, string | string[]>>({});
  const [hp, setHp] = useState('');
  const renderedAt = useRef(Date.now());
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  const set = (key: string, value: string | string[]) =>
    setData((d) => ({ ...d, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setError('');
    const r = await fetch(`/api/subdomains/${subdomain}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, _hp: hp, _t: renderedAt.current }),
    });
    const res = await r.json();
    if (!r.ok) {
      setError(res.error || 'Something went wrong');
      setStatus('error');
      return;
    }
    setStatus('done');
  };

  if (status === 'done') {
    return <p className={styles.publicSuccess}>{form.successMessage}</p>;
  }

  return (
    <form className={styles.publicForm} onSubmit={submit}>
      {form.title && <h3 className={styles.publicTitle}>{form.title}</h3>}
      {form.description && <p className={styles.publicDesc}>{form.description}</p>}

      {form.fields.map((f) => (
        <label key={f.key} className={styles.publicField}>
          <span>
            {f.label}
            {f.required ? ' *' : ''}
          </span>
          {f.type === 'textarea' ? (
            <textarea
              required={f.required}
              placeholder={f.placeholder}
              onChange={(e) => set(f.key, e.target.value)}
            />
          ) : f.type === 'select' ? (
            <select required={f.required} onChange={(e) => set(f.key, e.target.value)}>
              <option value="">Select…</option>
              {(f.options || []).map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={f.type === 'checkbox' ? 'checkbox' : f.type}
              required={f.required}
              placeholder={f.placeholder}
              onChange={(e) =>
                set(f.key, f.type === 'checkbox' ? String(e.target.checked) : e.target.value)
              }
            />
          )}
        </label>
      ))}

      {/* Honeypot — hidden from humans, filled by bots */}
      <input
        type="text"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1 }}
      />

      {error && <p className={styles.publicError}>{error}</p>}
      <button className={styles.publicSubmit} type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : form.submitButtonText}
      </button>
    </form>
  );
}
