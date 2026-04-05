import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { Subdomain } from '@/lib/models';
import { validateSubmission, createSubmission } from '@/lib/forms';
import { getClientIp } from '@/lib/rate-limit';

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

  const error = validateSubmission(sub.form, data);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  await createSubmission({
    subdomain: params.subdomain,
    ownerId: sub.userId,
    data,
    ip: getClientIp(request),
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
