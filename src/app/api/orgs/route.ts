import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/api-auth';
import {
  getUserOrgs,
  createOrganization,
  getOrganization,
  deleteOrganization,
} from '@/lib/orgs';

// GET: organizations the caller belongs to
export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const orgs = await getUserOrgs(auth.userId);
  return NextResponse.json({ orgs });
}

// POST: create a new organization (caller becomes owner)
export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { name } = await request.json();
  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Organization name is required' }, { status: 400 });
  }

  const org = await createOrganization(name.trim(), auth.userId, false);
  return NextResponse.json({ org }, { status: 201 });
}

// DELETE: delete the current organization (owner only; not personal)
export async function DELETE(request: NextRequest) {
  const ctx = await requireRole(request, ['owner']);
  if (ctx instanceof NextResponse) return ctx;

  const org = await getOrganization(ctx.orgId);
  if (!org) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
  }
  if (org.isPersonal) {
    return NextResponse.json(
      { error: 'Cannot delete your personal workspace' },
      { status: 409 }
    );
  }

  await deleteOrganization(ctx.orgId);
  return NextResponse.json({ success: true });
}
