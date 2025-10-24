import { cache } from 'react';
import { getDb } from './mongodb';
import { Subdomain } from './models';

/**
 * Server-only read of a subdomain document by its slug, wrapped in React
 * cache() so generateMetadata() and the page body share a single Mongo
 * query within one request. Returns null when no subdomain matches.
 */
export const getSubdomainBySlug = cache(
  async (slug: string): Promise<Subdomain | null> => {
    const db = await getDb();
    const doc = await db.collection('subdomains').findOne({ subdomain: slug });
    return doc as Subdomain | null;
  }
);
