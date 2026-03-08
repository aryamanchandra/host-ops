export type EffectiveStatus = 'draft' | 'scheduled' | 'live' | 'ended';

interface Scheduleable {
  isActive?: boolean;
  publishAt?: Date | string | null;
  unpublishAt?: Date | string | null;
}

function toDate(v?: Date | string | null): Date | null {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

/** Human-facing lifecycle state derived from the publish window + isActive. */
export function effectiveStatus(doc: Scheduleable, now: Date = new Date()): EffectiveStatus {
  const pub = toDate(doc.publishAt);
  const unpub = toDate(doc.unpublishAt);
  if (unpub && now >= unpub) return 'ended';
  if (pub && now < pub) return 'scheduled';
  if (doc.isActive === false) return 'draft';
  return 'live';
}

/** True when the subdomain should be publicly visible right now. */
export function isWithinWindow(doc: Scheduleable, now: Date = new Date()): boolean {
  const pub = toDate(doc.publishAt);
  const unpub = toDate(doc.unpublishAt);
  if (pub && now < pub) return false;
  if (unpub && now >= unpub) return false;
  return doc.isActive !== false;
}

/** Validate a publish window; returns an error message or null. */
export function validateWindow(
  publishAt?: string | null,
  unpublishAt?: string | null
): string | null {
  const pub = toDate(publishAt);
  const unpub = toDate(unpublishAt);
  if (pub && unpub && pub >= unpub) {
    return 'Unpublish time must be after publish time';
  }
  return null;
}
