'use client';

import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import MarkdownRenderer from './MarkdownRenderer';
import styles from '@/styles/Markdown.module.css';

export default function MarkdownEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const preview = useDebouncedValue(value, 250);

  return (
    <div className={styles.split}>
      <textarea
        className={styles.source}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={'# Hello\n\nWrite **markdown** here…'}
        rows={14}
      />
      <div className={styles.previewPane}>
        <MarkdownRenderer source={preview} />
      </div>
    </div>
  );
}
