'use client';

import { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react';
import { useAuth, useBioProfile } from '@/hooks';
import type { BioProfile } from '@/types/bio';
import styles from '@/styles/BioEditor.module.css';

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN!;

export default function BioEditorPage() {
  const { token } = useAuth();
  const { profile, save } = useBioProfile(token);
  const [draft, setDraft] = useState<BioProfile>({
    username: '',
    displayName: '',
    bio: '',
    avatar: '',
    accentColor: '#0070f3',
    links: [],
    isPublic: true,
  });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (profile) setDraft(profile);
  }, [profile]);

  const setLink = (i: number, patch: Partial<{ label: string; url: string }>) =>
    setDraft((d) => ({
      ...d,
      links: d.links.map((l, idx) => (idx === i ? { ...l, ...patch } : l)),
    }));
  const move = (i: number, to: number) =>
    setDraft((d) => {
      if (to < 0 || to >= d.links.length) return d;
      const a = [...d.links];
      const [m] = a.splice(i, 1);
      a.splice(to, 0, m);
      return { ...d, links: a.map((l, idx) => ({ ...l, order: idx })) };
    });
  const addLink = () =>
    setDraft((d) => ({
      ...d,
      links: [...d.links, { label: '', url: '', order: d.links.length }],
    }));
  const removeLink = (i: number) =>
    setDraft((d) => ({ ...d, links: d.links.filter((_, idx) => idx !== i) }));

  const onSave = async () => {
    setErr('');
    setMsg('');
    try {
      await save(draft);
      setMsg('Saved');
    } catch (e: any) {
      setErr(e.message || 'Failed to save');
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Link in Bio</h1>
      {draft.username && (
        <p className={styles.sub}>
          Public at <code>bio.{ROOT_DOMAIN}/{draft.username}</code>
        </p>
      )}

      <div className={styles.grid}>
        <input
          className={styles.input}
          placeholder="username"
          value={draft.username}
          onChange={(e) => setDraft({ ...draft, username: e.target.value.toLowerCase() })}
        />
        <input
          className={styles.input}
          placeholder="Display name"
          value={draft.displayName}
          onChange={(e) => setDraft({ ...draft, displayName: e.target.value })}
        />
      </div>
      <input
        className={styles.input}
        placeholder="Avatar image URL"
        value={draft.avatar || ''}
        onChange={(e) => setDraft({ ...draft, avatar: e.target.value })}
      />
      <textarea
        className={styles.textarea}
        placeholder="Short bio"
        value={draft.bio || ''}
        onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
      />
      <label className={styles.colorRow}>
        Accent color
        <input
          type="color"
          value={draft.accentColor || '#0070f3'}
          onChange={(e) => setDraft({ ...draft, accentColor: e.target.value })}
        />
      </label>

      <h3 className={styles.sectionTitle}>Links</h3>
      <div className={styles.linkList}>
        {draft.links.map((l, i) => (
          <div key={i} className={styles.linkRow}>
            <input
              placeholder="Label"
              value={l.label}
              onChange={(e) => setLink(i, { label: e.target.value })}
            />
            <input
              placeholder="https://…"
              value={l.url}
              onChange={(e) => setLink(i, { url: e.target.value })}
            />
            <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0}>
              <ArrowUp size={13} />
            </button>
            <button
              type="button"
              onClick={() => move(i, i + 1)}
              disabled={i === draft.links.length - 1}
            >
              <ArrowDown size={13} />
            </button>
            <button type="button" onClick={() => removeLink(i)}>
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
      <button type="button" className={styles.addLink} onClick={addLink}>
        <Plus size={14} /> Add link
      </button>

      <label className={styles.publicRow}>
        <input
          type="checkbox"
          checked={draft.isPublic}
          onChange={(e) => setDraft({ ...draft, isPublic: e.target.checked })}
        />
        Public
      </label>

      <div className={styles.actions}>
        {msg && <span className={styles.ok}>{msg}</span>}
        {err && <span className={styles.err}>{err}</span>}
        <button className={styles.save} onClick={onSave}>
          Save profile
        </button>
      </div>
    </div>
  );
}
