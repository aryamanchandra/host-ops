'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import FormBuilder from './FormBuilder';
import styles from '@/styles/Forms.module.css';

export default function FormManagerModal({
  token,
  subdomain,
  onClose,
}: {
  token: string;
  subdomain: string;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<'builder' | 'inbox'>('builder');

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.tabs}>
            <button
              className={tab === 'builder' ? styles.tabActive : styles.tab}
              onClick={() => setTab('builder')}
            >
              Form
            </button>
            <button
              className={tab === 'inbox' ? styles.tabActive : styles.tab}
              onClick={() => setTab('inbox')}
            >
              Submissions
            </button>
          </div>
          <button className={styles.icon} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className={styles.body}>
          {tab === 'builder' && <FormBuilder token={token} subdomain={subdomain} />}
        </div>
      </div>
    </div>
  );
}
