import { Edit2, Trash2, ExternalLink, BarChart3, History } from 'lucide-react';
import styles from '@/styles/page.module.css';
import versionStyles from '@/styles/VersionHistory.module.css';
import scheduleStyles from '@/styles/ScheduleChip.module.css';
import redirectStyles from '@/styles/Redirect.module.css';
import type { Subdomain } from '@/types';
import { effectiveStatus } from '@/lib/schedule';

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN!;

interface Props {
  subdomain: Subdomain;
  onEdit: (subdomain: Subdomain) => void;
  onDelete: (subdomain: string, title: string) => void;
  onViewAnalytics: (subdomain: string) => void;
  onHistory?: (subdomain: string) => void;
}

export default function SubdomainCard({ subdomain, onEdit, onDelete, onViewAnalytics, onHistory }: Props) {
  const status = subdomain.status || 'published';
  const sched = effectiveStatus(subdomain);
  const schedClass: Record<string, string> = {
    draft: scheduleStyles.chipDraft,
    scheduled: scheduleStyles.chipScheduled,
    live: scheduleStyles.chipLive,
    ended: scheduleStyles.chipEnded,
  };
  return (
    <div className={styles.subdomainCard}>
      <div className={styles.cardContent}>
        {/* Left: Title and URL */}
        <div className={styles.cardInfo}>
          <div className={styles.cardTitleRow}>
            <h3 className={styles.cardTitle}>{subdomain.title}</h3>
            <span
              className={status === 'draft' ? versionStyles.badgeDraft : versionStyles.badgePublished}
            >
              {status}
            </span>
            <span className={schedClass[sched]}>{sched}</span>
            {subdomain.type === 'redirect' && (
              <span className={redirectStyles.badgeRedirect}>redirect</span>
            )}
          </div>
          <a
            href={`http://${subdomain.subdomain}.${ROOT_DOMAIN}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.cardUrl}
            onClick={(e) => e.stopPropagation()}
          >
            {subdomain.subdomain}.{ROOT_DOMAIN}
            <ExternalLink size={12} />
          </a>
          {subdomain.type === 'redirect' && subdomain.redirectUrl && (
            <div className={redirectStyles.targetRow}>
              → {subdomain.redirectUrl}
            </div>
          )}
          {subdomain.description && (
            <p className={styles.cardDesc}>{subdomain.description}</p>
          )}
        </div>

        {/* Right: Actions */}
        <div className={styles.cardActions}>
          <button
            onClick={() => onViewAnalytics(subdomain.subdomain)}
            className={styles.actionBtn}
          >
            <BarChart3 size={14} />
          </button>
          {onHistory && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onHistory(subdomain.subdomain);
              }}
              className={styles.actionBtn}
              title="Version history"
            >
              <History size={14} />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(subdomain);
            }}
            className={styles.actionBtn}
            title="Edit"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(subdomain.subdomain, subdomain.title);
            }}
            className={styles.actionBtnDanger}
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
