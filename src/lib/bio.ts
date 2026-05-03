import { getDb } from './mongodb';
import { BioProfile } from './models';

let indexesEnsured = false;

export async function ensureBioIndexes(): Promise<void> {
  if (indexesEnsured) return;
  const db = await getDb();
  await db.collection('bio_profiles').createIndex({ userId: 1 }, { unique: true });
  await db.collection('bio_profiles').createIndex({ username: 1 }, { unique: true });
  indexesEnsured = true;
}

export async function getBioByUser(userId: string): Promise<BioProfile | null> {
  const db = await getDb();
  return db.collection<BioProfile>('bio_profiles').findOne({ userId });
}

export async function getBioByUsername(username: string): Promise<BioProfile | null> {
  const db = await getDb();
  return db
    .collection<BioProfile>('bio_profiles')
    .findOne({ username: username.toLowerCase(), isPublic: true });
}

export async function saveBio(
  userId: string,
  data: Partial<BioProfile>
): Promise<void> {
  const db = await getDb();
  await ensureBioIndexes();
  const username = (data.username || '').toLowerCase();
  const now = new Date();
  await db.collection('bio_profiles').updateOne(
    { userId },
    {
      $set: {
        username,
        displayName: data.displayName || username,
        avatar: data.avatar,
        bio: data.bio,
        accentColor: data.accentColor || '#0070f3',
        links: data.links || [],
        isPublic: data.isPublic !== false,
        userId,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true }
  );
}
