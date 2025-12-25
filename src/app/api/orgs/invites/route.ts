import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/api-auth';
import { createInvite, getOrgInvites } from '@/lib/orgs';
import type { OrgRole } from '@/lib/models';

// GET: pending invites for the current org (owner/admin only)
export async function GET(request: NextRequest) {
  const ctx = await requireRole(request, ['owner', 'admin']);
  if (ctx instanceof NextResponse) return ctx;

  const invites = await getOrgInvites(ctx.orgId);
  return NextResponse.json({ invites });
}

// POST: invite a member by email. Returns a shareable invite link.
// (Email delivery is a follow-up; for now the link is shared manually.)
export async function POST(request: NextRequest) {
  const ctx = await requireRole(request, ['owner', 'admin']);
  if (ctx instanceof NextResponse) return ctx;

  const { email, role } = (await request.json()) as { email: string; role?: OrgRole };
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
  }
  const inviteRole: OrgRole = role === 'admin' ? 'admin' : 'member';

  const invite = await createInvite(ctx.orgId, email, inviteRole, ctx.userId);
  return NextResponse.json(
    { invite, inviteUrl: `/invite/${invite.token}` },
    { status: 201 }
  );
}
