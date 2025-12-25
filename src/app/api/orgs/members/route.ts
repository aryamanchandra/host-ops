import { NextRequest, NextResponse } from 'next/server';
import { requireOrg } from '@/lib/api-auth';
import { getOrgMembers } from '@/lib/orgs';

// GET: members of the current organization (x-org-id header)
export async function GET(request: NextRequest) {
  const ctx = await requireOrg(request);
  if (ctx instanceof NextResponse) return ctx;

  const members = await getOrgMembers(ctx.orgId);
  return NextResponse.json({ members });
}
