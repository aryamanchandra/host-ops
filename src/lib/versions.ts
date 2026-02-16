import { getDb } from './mongodb';
import { Subdomain } from './models';
import type { SubdomainVersion, VersionReason } from '@/types/version';

const KEEP_VERSIONS = 50;
let indexesEnsured = false;

export async function ensureVersionIndexes(): Promise<void> {
  if (indexesEnsured) return;
  const db = await getDb();
  await db.collection('subdomain_versions').createIndex({ subdomain: 1, version: -1 });
  await db.collection('subdomain_versions').createIndex({ subdomain: 1, userId: 1 });
  indexesEnsured = true;
}

/** Append a snapshot of the current subdomain state to its version history. */
export async function snapshotVersion(
  doc: Subdomain,
  reason: VersionReason,
  author?: { id: string; name?: string }
): Promise<void> {
  const db = await getDb();
  await ensureVersionIndexes();

  const snapshot: SubdomainVersion = {
    subdomain: doc.subdomain,
    userId: doc.userId,
    version: doc.version || 1,
    title: doc.title,
    description: doc.description,
    content: doc.content,
    customCss: doc.customCss,
    contentFormat: doc.contentFormat,
    blocks: doc.blocks,
    status: doc.status || 'published',
    authorId: author?.id || doc.userId,
    authorName: author?.name,
    reason,
    createdAt: new Date(),
  };

  await db.collection('subdomain_versions').insertOne(snapshot as any);
  await pruneVersions(doc.subdomain, KEEP_VERSIONS);
}

export async function listVersions(subdomain: string): Promise<SubdomainVersion[]> {
  const db = await getDb();
  const rows = await db
    .collection('subdomain_versions')
    .find({ subdomain })
    .sort({ version: -1 })
    .limit(KEEP_VERSIONS)
    .toArray();
  return rows.map((r: any) => ({
    ...r,
    _id: r._id.toString(),
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
  }));
}

export async function getVersion(
  subdomain: string,
  version: number
): Promise<SubdomainVersion | null> {
  const db = await getDb();
  const r = await db.collection('subdomain_versions').findOne({ subdomain, version });
  return r ? ({ ...(r as any), _id: r._id.toString() } as SubdomainVersion) : null;
}

/** Keep only the newest `keepN` versions for a subdomain. */
export async function pruneVersions(subdomain: string, keepN = KEEP_VERSIONS): Promise<void> {
  const db = await getDb();
  const stale = await db
    .collection('subdomain_versions')
    .find({ subdomain })
    .sort({ version: -1 })
    .skip(keepN)
    .toArray();
  if (stale.length) {
    await db
      .collection('subdomain_versions')
      .deleteMany({ _id: { $in: stale.map((r: any) => r._id) } });
  }
}
