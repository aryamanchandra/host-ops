/**
 * One-time migration: give every existing user a personal organization and
 * backfill orgId onto their subdomains, short_links, and pageviews so the
 * multi-tenant scoping picks up legacy data. Idempotent — safe to re-run.
 *
 * Run with `npm run migrate:orgs`.
 */
import { config } from 'dotenv';
import { MongoClient } from 'mongodb';

config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI is required to run the migration');
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'workspace'
  );
}

async function migrate() {
  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db();

  const users = await db.collection('users').find({}).toArray();
  let createdOrgs = 0;

  for (const u of users) {
    const userId = u._id.toString();
    let orgId: string | undefined = u.defaultOrgId;

    if (!orgId) {
      const label = u.name || u.username || u.email || 'Personal';
      const base = slugify(label);
      let slug = base;
      let n = 1;
      while (await db.collection('organizations').findOne({ slug })) {
        slug = `${base}-${n++}`;
      }
      const now = new Date();
      const res = await db.collection('organizations').insertOne({
        name: `${label}'s Workspace`,
        slug,
        ownerId: userId,
        isPersonal: true,
        createdAt: now,
        updatedAt: now,
      } as any);
      orgId = res.insertedId.toString();
      await db.collection('org_members').updateOne(
        { orgId, userId },
        { $setOnInsert: { orgId, userId, role: 'owner', createdAt: now } },
        { upsert: true }
      );
      await db.collection('users').updateOne({ _id: u._id }, { $set: { defaultOrgId: orgId } });
      createdOrgs++;
    }

    await db
      .collection('subdomains')
      .updateMany({ userId, orgId: { $exists: false } }, { $set: { orgId } });
    await db
      .collection('short_links')
      .updateMany({ userId, orgId: { $exists: false } }, { $set: { orgId } });
  }

  // Backfill pageviews from their subdomain's orgId.
  const subs = await db
    .collection('subdomains')
    .find({ orgId: { $exists: true } })
    .toArray();
  for (const s of subs) {
    await db
      .collection('pageviews')
      .updateMany(
        { subdomain: s.subdomain, orgId: { $exists: false } },
        { $set: { orgId: s.orgId } }
      );
  }

  console.log(`Migration complete. Created ${createdOrgs} personal org(s).`);
  await client.close();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
