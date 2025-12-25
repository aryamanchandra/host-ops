import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { requireAuth } from '@/lib/api-auth';
import { getInviteByToken, acceptInvite } from '@/lib/orgs';
import { getDb } from '@/lib/mongodb';

// GET: preview an invite (org name, role, status) for the landing page.
export async function GET(
  _request: NextRequest,
  { params }: { params: { token: string } }
) {
  const invite = await getInviteByToken(params.token);
  if (!invite) {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
  }

  let orgName = '';
  try {
    const db = await getDb();
    const org = await db
      .collection('organizations')
      .findOne({ _id: new ObjectId(invite.orgId) });
    orgName = (org as any)?.name || '';
  } catch {
    // ignore — preview falls back to empty name
  }

  return NextResponse.json({
    email: invite.email,
    role: invite.role,
    status: invite.status,
    orgName,
    expired: invite.expiresAt < new Date(),
  });
}

// POST: accept an invite (must be authenticated).
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const result = await acceptInvite(params.token, auth.userId);
  if (!result) {
    return NextResponse.json(
      { error: 'Invite is invalid, already used, or expired' },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, orgId: result.orgId });
}
