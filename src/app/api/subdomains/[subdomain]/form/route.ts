import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { getDb } from '@/lib/mongodb';
import { Subdomain } from '@/lib/models';
import type { FormSchema } from '@/types/form';

// GET: the form schema for an owned subdomain.
export async function GET(
  request: NextRequest,
  { params }: { params: { subdomain: string } }
) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  const db = await getDb();
  const sub = (await db
    .collection<Subdomain>('subdomains')
    .findOne({ subdomain: params.subdomain, userId: auth.userId })) as Subdomain | null;
  if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ form: sub.form || null });
}

// PUT: save the form schema.
export async function PUT(
  request: NextRequest,
  { params }: { params: { subdomain: string } }
) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  const schema = (await request.json()) as FormSchema;
  const db = await getDb();
  const res = await db
    .collection('subdomains')
    .updateOne(
      { subdomain: params.subdomain, userId: auth.userId },
      { $set: { form: { ...schema, updatedAt: new Date() } } }
    );
  if (!res.matchedCount) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}

// DELETE: remove the form from a subdomain.
export async function DELETE(
  request: NextRequest,
  { params }: { params: { subdomain: string } }
) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  const db = await getDb();
  await db
    .collection('subdomains')
    .updateOne({ subdomain: params.subdomain, userId: auth.userId }, { $unset: { form: '' } });
  return NextResponse.json({ success: true });
}
