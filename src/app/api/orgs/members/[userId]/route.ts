import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/api-auth';
import { setMemberRole, removeMember, countOwners, getMembership } from '@/lib/orgs';
import type { OrgRole } from '@/lib/models';

// PATCH: change a member's role (owner/admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const ctx = await requireRole(request, ['owner', 'admin']);
  if (ctx instanceof NextResponse) return ctx;

  const { role } = (await request.json()) as { role: OrgRole };
  if (!['owner', 'admin', 'member'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  // Do not allow demoting the last remaining owner.
  const target = await getMembership(ctx.orgId, params.userId);
  if (target?.role === 'owner' && role !== 'owner' && (await countOwners(ctx.orgId)) <= 1) {
    return NextResponse.json(
      { error: 'An organization must have at least one owner' },
      { status: 409 }
    );
  }

  await setMemberRole(ctx.orgId, params.userId, role);
  return NextResponse.json({ success: true });
}

// DELETE: remove a member (owner/admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const ctx = await requireRole(request, ['owner', 'admin']);
  if (ctx instanceof NextResponse) return ctx;

  const target = await getMembership(ctx.orgId, params.userId);
  if (target?.role === 'owner' && (await countOwners(ctx.orgId)) <= 1) {
    return NextResponse.json(
      { error: 'Cannot remove the last owner' },
      { status: 409 }
    );
  }

  await removeMember(ctx.orgId, params.userId);
  return NextResponse.json({ success: true });
}
