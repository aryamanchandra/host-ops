'use client';

import type { Utm } from '@/types/links';
import styles from '@/styles/LinkExtras.module.css';

export default function UtmBuilder({
  value,
  onChange,
}: {
  value: Utm;
  onChange: (u: Utm) => void;
}) {
  const field = (key: keyof Utm, label: string) => (
    <input
      className={styles.utmInput}
      placeholder={label}
      value={value[key] || ''}
      onChange={(e) => onChange({ ...value, [key]: e.target.value })}
    />
  );

  return (
    <div className={styles.utmGrid}>
      {field('source', 'utm_source')}
      {field('medium', 'utm_medium')}
      {field('campaign', 'utm_campaign')}
      {field('term', 'utm_term')}
      {field('content', 'utm_content')}
    </div>
  );
}
