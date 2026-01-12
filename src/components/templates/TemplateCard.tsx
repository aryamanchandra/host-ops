import styles from '@/styles/Templates.module.css';
import type { Template } from '@/types/template';

export default function TemplateCard({
  template,
  onPreview,
  onUse,
}: {
  template: Template;
  onPreview: () => void;
  onUse: () => void;
}) {
  return (
    <div className={styles.card}>
      <div className={styles.thumb}>
        <span className={styles.badge}>{template.category}</span>
        <span className={styles.thumbTitle}>{template.name}</span>
      </div>
      <div className={styles.body}>
        <h3>{template.name}</h3>
        <p>{template.description}</p>
        <div className={styles.tags}>
          {template.tags.map((t) => (
            <span key={t} className={styles.tag}>
              {t}
            </span>
          ))}
        </div>
        <div className={styles.cardActions}>
          <button className={styles.preview} onClick={onPreview}>
            Preview
          </button>
          <button className={styles.use} onClick={onUse}>
            Use template
          </button>
        </div>
      </div>
    </div>
  );
}
