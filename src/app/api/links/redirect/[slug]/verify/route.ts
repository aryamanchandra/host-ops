import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ShortLink } from '@/lib/models';
import { verifyPassword } from '@/lib/auth';
import { isExpired } from '@/lib/linkExtras';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

// Public: verify a password-protected link and return its target on success.
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const ip = getClientIp(request);
  if (!rateLimit(`verify:${ip}`, 20, 60_000).allowed) {
    return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });
  }

  const { password } = await request.json();
  const db = await getDb();
  const link = await db
    .collection<ShortLink>('short_links')
    .findOne({ slug: params.slug, isActive: true });

  if (!link) return NextResponse.json({ error: 'Link not found' }, { status: 404 });
  if (isExpired(link.expiresAt)) {
    return NextResponse.json({ error: 'Link expired', expired: true }, { status: 410 });
  }
  if (!link.passwordHash) {
    return NextResponse.json({ error: 'No password required' }, { status: 400 });
  }

  const ok = await verifyPassword(password || '', link.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  await db.collection('short_links').updateOne({ slug: params.slug }, { $inc: { clicks: 1 } });
  return NextResponse.json({ targetUrl: link.targetUrl });
}
