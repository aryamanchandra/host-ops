import styles from '@/styles/ScheduleChip.module.css';

export default function ScheduleFields({
  publishAt,
  unpublishAt,
  onChange,
}: {
  publishAt: string;
  unpublishAt: string;
  onChange: (patch: { publishAt?: string; unpublishAt?: string }) => void;
}) {
  return (
    <div className={styles.fields}>
      <label className={styles.field}>
        <span>Publish at</span>
        <input
          type="datetime-local"
          value={publishAt}
          onChange={(e) => onChange({ publishAt: e.target.value })}
        />
      </label>
      <label className={styles.field}>
        <span>Unpublish at</span>
        <input
          type="datetime-local"
          value={unpublishAt}
          onChange={(e) => onChange({ unpublishAt: e.target.value })}
        />
      </label>
    </div>
  );
}
