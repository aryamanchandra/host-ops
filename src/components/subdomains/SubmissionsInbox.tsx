'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { useSubmissions } from '@/hooks';
import { orgHeaders } from '@/hooks/useOrg';
import type { SubmissionView } from '@/types/form';
import styles from '@/styles/Forms.module.css';

export default function SubmissionsInbox({
  token,
  subdomain,
}: {
  token: string;
  subdomain: string;
}) {
  const { submissions, loading, markRead } = useSubmissions(token, subdomain);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [selected, setSelected] = useState<SubmissionView | null>(null);

  const filtered = unreadOnly ? submissions.filter((s) => !s.isRead) : submissions;

  const open = (s: SubmissionView) => {
    setSelected(s);
    if (!s.isRead) markRead(s._id);
  };

  const exportCsv = async () => {
    const r = await fetch(
      `/api/submissions/export?subdomain=${encodeURIComponent(subdomain)}`,
      { headers: orgHeaders(token) }
    );
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${subdomain}-submissions.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.inbox}>
      <div className={styles.inboxBar}>
        <label className={styles.unreadToggle}>
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
          />
          Unread only
        </label>
        <button className={styles.export} onClick={exportCsv}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      {loading ? (
        <p className={styles.muted}>Loading…</p>
      ) : filtered.length === 0 ? (
        <p className={styles.muted}>No submissions yet.</p>
      ) : (
        <div className={styles.subList}>
          {filtered.map((s) => (
            <button
              key={s._id}
              className={`${styles.subRow} ${s.isRead ? '' : styles.subUnread}`}
              onClick={() => open(s)}
            >
              <span className={styles.subPreview}>
                {Object.values(s.data)[0] != null
                  ? String(Object.values(s.data)[0]).slice(0, 60)
                  : '(empty)'}
              </span>
              <span className={styles.subDate}>
                {new Date(s.createdAt).toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className={styles.detailOverlay} onClick={() => setSelected(null)}>
          <div className={styles.detail} onClick={(e) => e.stopPropagation()}>
            <h4>Submission</h4>
            {Object.entries(selected.data).map(([k, v]) => (
              <div key={k} className={styles.detailRow}>
                <span className={styles.detailKey}>{k}</span>
                <span>{Array.isArray(v) ? v.join(', ') : String(v)}</span>
              </div>
            ))}
            <button className={styles.export} onClick={() => setSelected(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
