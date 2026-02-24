'use client';

import { useState } from 'react';
import { diffLines } from 'diff';
import { X, RotateCcw } from 'lucide-react';
import { useVersions } from '@/hooks';
import type { VersionView } from '@/types';
import styles from '@/styles/VersionHistory.module.css';

function previewDoc(v: VersionView): string {
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:-apple-system,sans-serif;max-width:680px;margin:0 auto;padding:24px;line-height:1.6;color:#333}${
    v.customCss || ''
  }</style></head><body>${v.content || ''}</body></html>`;
}

export default function VersionHistoryModal({
  token,
  subdomain,
  onClose,
  onChanged,
}: {
  token: string;
  subdomain: string;
  onClose: () => void;
  onChanged?: () => void;
}) {
  const { versions, loading, restore, publish } = useVersions(token, subdomain);
  const [selected, setSelected] = useState<VersionView | null>(null);
  const [busy, setBusy] = useState(false);

  const doRestore = async (v: number) => {
    setBusy(true);
    try {
      await restore(v);
      onChanged?.();
    } finally {
      setBusy(false);
    }
  };

  const doPublish = async () => {
    setBusy(true);
    try {
      await publish();
      onChanged?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Version history</h3>
          <div className={styles.headerActions}>
            <button className={styles.publish} onClick={doPublish} disabled={busy}>
              Publish current
            </button>
            <button className={styles.icon} onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className={styles.body}>
          <div className={styles.list}>
            {loading ? (
              <p className={styles.muted}>Loading…</p>
            ) : versions.length === 0 ? (
              <p className={styles.muted}>No history yet. Edits will appear here.</p>
            ) : (
              versions.map((v) => (
                <div
                  key={v._id}
                  className={`${styles.row} ${
                    selected?._id === v._id ? styles.rowActive : ''
                  }`}
                  onClick={() => setSelected(v)}
                >
                  <div className={styles.rowMain}>
                    <strong>v{v.version}</strong>
                    <span className={styles.reason}>{v.reason}</span>
                  </div>
                  <div className={styles.rowMeta}>
                    <span>{v.authorName || '—'}</span>
                    <span>{new Date(v.createdAt).toLocaleString()}</span>
                  </div>
                  <button
                    className={styles.restore}
                    onClick={(e) => {
                      e.stopPropagation();
                      doRestore(v.version);
                    }}
                    disabled={busy}
                  >
                    <RotateCcw size={13} /> Restore
                  </button>
                </div>
              ))
            )}
          </div>

          {selected && (
            <div className={styles.pane}>
              <div className={styles.paneLabel}>Preview · v{selected.version}</div>
              <iframe
                className={styles.preview}
                sandbox=""
                srcDoc={previewDoc(selected)}
                title={`Version ${selected.version} preview`}
              />
              <div className={styles.paneLabel}>Changes vs latest</div>
              <div className={styles.diff}>
                {diffLines(versions[0]?.content || '', selected.content || '').map(
                  (part, i) => (
                    <pre
                      key={i}
                      className={
                        part.added
                          ? styles.added
                          : part.removed
                          ? styles.removed
                          : styles.ctx
                      }
                    >
                      {part.value}
                    </pre>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
