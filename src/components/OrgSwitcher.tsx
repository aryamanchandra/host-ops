'use client';

import { useState } from 'react';
import { ChevronDown, Plus, Check, Building2 } from 'lucide-react';
import { useOrg } from '@/hooks/useOrg';
import styles from '@/styles/OrgSwitcher.module.css';

export default function OrgSwitcher({
  token,
  collapsed,
}: {
  token: string;
  collapsed: boolean;
}) {
  const { orgs, currentOrg, setCurrentOrgId, createOrg } = useOrg(token);
  const [open, setOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [err, setErr] = useState('');

  const switchOrg = (id: string) => {
    setCurrentOrgId(id);
    setOpen(false);
    // Reload so every org-scoped hook refetches against the new org.
    window.location.reload();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    try {
      await createOrg(name.trim());
      setShowCreate(false);
      setName('');
      window.location.reload();
    } catch (e: any) {
      setErr(e.message || 'Failed to create organization');
    }
  };

  if (collapsed) {
    return (
      <button
        className={styles.collapsedBtn}
        title={currentOrg?.name || 'Workspace'}
        onClick={() => setOpen((o) => !o)}
      >
        <Building2 size={18} />
      </button>
    );
  }

  return (
    <div className={styles.wrap}>
      <button className={styles.trigger} onClick={() => setOpen((o) => !o)}>
        <Building2 size={16} />
        <span className={styles.name}>{currentOrg?.name || 'Workspace'}</span>
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className={styles.menu}>
          {orgs.map((o) => (
            <button key={o._id} className={styles.item} onClick={() => switchOrg(o._id)}>
              <span>{o.name}</span>
              {o._id === currentOrg?._id && <Check size={14} />}
            </button>
          ))}
          <button
            className={styles.create}
            onClick={() => {
              setOpen(false);
              setShowCreate(true);
            }}
          >
            <Plus size={14} /> New organization
          </button>
        </div>
      )}

      {showCreate && (
        <div className={styles.modalOverlay} onClick={() => setShowCreate(false)}>
          <form
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            onSubmit={submit}
          >
            <h3>Create organization</h3>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Organization name"
              autoFocus
            />
            {err && <p className={styles.err}>{err}</p>}
            <div className={styles.actions}>
              <button type="button" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
              <button type="submit" disabled={!name.trim()}>
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
