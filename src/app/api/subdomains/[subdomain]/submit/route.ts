import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { Subdomain } from '@/lib/models';
import { validateSubmission, createSubmission } from '@/lib/forms';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

const MIN_FILL_MS = 2000;

// Public: accept a contact-form submission for a subdomain.
export async function POST(
  request: NextRequest,
  { params }: { params: { subdomain: string } }
) {
  const db = await getDb();
  const sub = (await db
    .collection<Subdomain>('subdomains')
    .findOne({ subdomain: params.subdomain })) as Subdomain | null;

  if (!sub || !sub.form || !sub.form.enabled) {
    return NextResponse.json({ error: 'Form not available' }, { status: 404 });
  }

  const body = await request.json();
  const data = (body?.data || {}) as Record<string, string | string[]>;
  const ip = getClientIp(request);

  // Spam guard 1: honeypot field — bots fill it; pretend success and drop.
  if (body?._hp) {
    return NextResponse.json({ success: true });
  }
  // Spam guard 2: minimum fill time between render and submit.
  const renderedAt = Number(body?._t || 0);
  if (renderedAt && Date.now() - renderedAt < MIN_FILL_MS) {
    return NextResponse.json({ error: 'Submitted too quickly' }, { status: 400 });
  }
  // Spam guard 3: per-IP rate limit.
  if (!rateLimit(`submit:${ip}`, 5, 60_000).allowed) {
    return NextResponse.json({ error: 'Too many submissions' }, { status: 429 });
  }

  const error = validateSubmission(sub.form, data);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  await createSubmission({
    subdomain: params.subdomain,
    ownerId: sub.userId,
    data,
    ip,
    userAgent: request.headers.get('user-agent') || undefined,
    referer: request.headers.get('referer') || undefined,
    isRead: false,
    createdAt: new Date(),
  });

  return NextResponse.json({
    success: true,
    message: sub.form.successMessage || 'Thanks!',
  });
}
