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

  console.log('Indexes ensured.');
  await client.close();
}

ensureIndexes().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});
