/**
 * Database setup: creates the indexes Domainbase relies on.
 * Run with `npm run setup`. Safe to run repeatedly — createIndex is idempotent.
 */
import { config } from 'dotenv';
import { MongoClient } from 'mongodb';

config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI is required to run setup');
}

async function ensureIndexes() {
  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db();

  // users: fast lookup by email / google id for auth
  await db.collection('users').createIndex({ email: 1 }, { sparse: true });
  await db.collection('users').createIndex({ googleId: 1 }, { sparse: true });

  // short_links: slug is the public key and must be unique
  await db.collection('short_links').createIndex({ slug: 1 }, { unique: true });
  await db.collection('short_links').createIndex({ userId: 1, createdAt: -1 });

  // pageviews: analytics queries filter by subdomain over a time window
  await db.collection('pageviews').createIndex({ subdomain: 1, timestamp: -1 });
  // pageviews: geo aggregation groups by country within a subdomain
  await db.collection('pageviews').createIndex({ subdomain: 1, countryCode: 1 });
  // pageviews: campaign attribution scans by subdomain + utm campaign over time
  await db.collection('pageviews').createIndex({ subdomain: 1, utmCampaign: 1, timestamp: -1 });
  // pageviews: live dashboard queries the most recent events by timestamp
  await db.collection('pageviews').createIndex({ timestamp: -1 });

  // subdomains: subdomain is the public host key (unique); list by owner
  await db.collection('subdomains').createIndex({ subdomain: 1 }, { unique: true });
  await db.collection('subdomains').createIndex({ userId: 1, createdAt: -1 });

  // subdomains: scheduled-publish cron scans by isActive + boundary times
  await db
    .collection('subdomains')
    .createIndex({ isActive: 1, publishAt: 1 }, { partialFilterExpression: { publishAt: { $exists: true } } });
  await db
    .collection('subdomains')
    .createIndex({ isActive: 1, unpublishAt: 1 }, { partialFilterExpression: { unpublishAt: { $exists: true } } });

  // multi-tenant: organizations, members, invites
  await db.collection('organizations').createIndex({ slug: 1 }, { unique: true });
  await db.collection('org_members').createIndex({ orgId: 1, userId: 1 }, { unique: true });
  await db.collection('org_members').createIndex({ userId: 1 });
  await db.collection('org_invites').createIndex({ token: 1 }, { unique: true });
  await db.collection('org_invites').createIndex({ orgId: 1, status: 1 });

  // org-scoped listing of tenant data
  await db.collection('subdomains').createIndex({ orgId: 1, createdAt: -1 });
  await db.collection('short_links').createIndex({ orgId: 1, createdAt: -1 });

  // form submissions inbox + spam-window queries
  await db.collection('form_submissions').createIndex({ subdomain: 1, ownerId: 1, createdAt: -1 });
  await db.collection('form_submissions').createIndex({ ownerId: 1, isRead: 1 });
  await db.collection('form_submissions').createIndex({ subdomain: 1, ip: 1, createdAt: -1 });

  console.log('Indexes ensured.');
  await client.close();
}

ensureIndexes().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});
