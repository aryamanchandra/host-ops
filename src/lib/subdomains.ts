import { cache } from 'react';
import type { Db } from 'mongodb';
import { getDb } from './mongodb';
import { Subdomain } from './models';
import { isWithinWindow } from './schedule';

let indexesEnsured = false;

/**
 * Idempotently ensure the unique index backing subdomain-slug lookups
 * exists, even in environments where `npm run setup` was never run.
 * Best-effort: a failure here must not break the public read path.
 */
async function ensureSubdomainIndexes(db: Db): Promise<void> {
  if (indexesEnsured) return;
  try {
    await db.collection('subdomains').createIndex({ subdomain: 1 }, { unique: true });
    indexesEnsured = true;
  } catch (err) {
    console.error('Failed to ensure subdomain index:', err);
  }
}

/**
 * Server-only read of a subdomain document by its slug, wrapped in React
 * cache() so generateMetadata() and the page body share a single Mongo
 * query within one request. Returns null when no subdomain matches.
 */
export const getSubdomainBySlug = cache(
  async (slug: string): Promise<Subdomain | null> => {
    const db = await getDb();
    await ensureSubdomainIndexes(db);
    const doc = (await db
      .collection('subdomains')
      .findOne({ subdomain: slug })) as Subdomain | null;
    if (!doc) return null;

    // Respect the scheduled publish window for public visitors.
    if (!isWithinWindow(doc)) return null;

    // Public visitors see the published snapshot; legacy docs without one
    // fall back to their live content.
    if (doc.publishedContent) {
      const p = doc.publishedContent;
      return {
        ...doc,
        title: p.title,
        description: p.description,
        content: p.content,
        customCss: p.customCss,
        contentFormat: p.contentFormat,
        blocks: p.blocks,
      };
    }
    return doc;
  }
);
