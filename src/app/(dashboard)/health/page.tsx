'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth, useMonitors } from '@/hooks';
import MonitorCard from '@/components/monitors/MonitorCard';
import styles from '@/styles/HealthMonitor.module.css';

export default function HealthPage() {
  const { token } = useAuth();
  const { monitors, loading, create, remove, check } = useMonitors(token);
  const [showForm, setShowForm] = useState(false);
  const [host, setHost] = useState('');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await create({ host: host.trim().toLowerCase() });
      setHost('');
      setShowForm(false);
    } catch (e: any) {
      setError(e.message || 'Failed to add monitor');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Health</h1>
          <p className={styles.sub}>Uptime and SSL monitoring.</p>
        </div>
        <button className={styles.addBtn} onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add monitor
        </button>
      </div>

      {loading ? (
        <p className={styles.muted}>Loading…</p>
      ) : monitors.length === 0 ? (
        <p className={styles.muted}>No monitors yet. Add a host to start checking.</p>
      ) : (
        <div className={styles.grid}>
          {monitors.map((m) => (
            <MonitorCard key={m._id} monitor={m} onCheck={check} onDelete={remove} />
          ))}
        </div>
      )}

      {showForm && (
        <div className={styles.overlay} onClick={() => setShowForm(false)}>
          <form className={styles.modal} onClick={(e) => e.stopPropagation()} onSubmit={submit}>
            <h3>Add monitor</h3>
            <input
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="example.com"
              autoFocus
              required
            />
            {error && <p className={styles.err}>{error}</p>}
            <div className={styles.modalActions}>
              <button type="button" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit">Add</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
