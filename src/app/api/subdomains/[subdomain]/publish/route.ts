import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { getDb } from '@/lib/mongodb';
import { Subdomain } from '@/lib/models';
import { snapshotVersion } from '@/lib/versions';

// POST: promote the current draft to published.
export async function POST(
  request: NextRequest,
  { params }: { params: { subdomain: string } }
) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const db = await getDb();
  const current = (await db
    .collection<Subdomain>('subdomains')
    .findOne({ subdomain: params.subdomain, userId: auth.userId })) as Subdomain | null;
  if (!current) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const publishedContent = {
    title: current.title,
    description: current.description,
    content: current.content,
    customCss: current.customCss,
    contentFormat: current.contentFormat,
    blocks: current.blocks,
    publishedAt: new Date(),
  };

  await snapshotVersion(current, 'publish', { id: auth.userId, name: auth.username });
  await db.collection('subdomains').updateOne(
    { subdomain: params.subdomain, userId: auth.userId },
    { $set: { publishedContent, status: 'published', updatedAt: new Date() } }
  );

  return NextResponse.json({ success: true });
}
