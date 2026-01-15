'use client';

import { X } from 'lucide-react';
import type { Template } from '@/types/template';
import styles from '@/styles/Templates.module.css';

export default function TemplatePreviewModal({
  template,
  onClose,
  onUse,
}: {
  template: Template;
  onClose: () => void;
  onUse: () => void;
}) {
  // Render the template inside a fully sandboxed iframe (no scripts).
  const srcDoc = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;max-width:760px;margin:0 auto;padding:40px 24px;line-height:1.7;color:#333}a{color:#0070f3}${template.customCss || ''}</style></head><body>${template.content}</body></html>`;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.previewModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.previewHeader}>
          <strong>{template.name}</strong>
          <div className={styles.previewHeaderActions}>
            <button className={styles.use} onClick={onUse}>
              Use template
            </button>
            <button className={styles.iconBtn} onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>
        <iframe
          className={styles.previewFrame}
          sandbox=""
          srcDoc={srcDoc}
          title={`${template.name} preview`}
        />
      </div>
    </div>
  );
}
