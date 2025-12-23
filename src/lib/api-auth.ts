import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth';
import { getMembership } from './orgs';
import type { OrgRole } from './models';

export interface AuthContext {
  userId: string;
  username: string;
}

export interface OrgContext extends AuthContext {
  orgId: string;
  role: OrgRole;
}

/**
 * Extract and verify the Bearer token from a request.
 * Returns the auth context, or null if missing/invalid.
 */
export function getAuth(request: NextRequest): AuthContext | null {
  const header = request.headers.get('authorization');

  // Bearer header first; fall back to a ?token= query param for transports
  // that cannot set headers (EventSource / SSE, polling fallback).
  let token = '';
  if (header && header.startsWith('Bearer ')) {
    token = header.slice('Bearer '.length).trim();
  } else {
    token = request.nextUrl.searchParams.get('token') || '';
  }
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) return null;

  return { userId: decoded.userId, username: decoded.username };
}

export function unauthorized(message = 'Unauthorized'): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 });
}

/**
 * Resolve the authenticated user or return a 401 response.
 * Usage:
 *   const auth = requireAuth(request);
 *   if (auth instanceof NextResponse) return auth;
 *   // ...use auth.userId
 */
export function requireAuth(request: NextRequest): AuthContext | NextResponse {
  const auth = getAuth(request);
  if (!auth) return unauthorized();
  return auth;
}

/**
 * Resolve the current organization from the `x-org-id` header and verify the
 * caller is a member. Returns the auth context plus orgId + role.
 */
export async function requireOrg(
  request: NextRequest
): Promise<OrgContext | NextResponse> {
  const auth = getAuth(request);
  if (!auth) return unauthorized();

  const orgId = request.headers.get('x-org-id') || '';
  if (!orgId) {
    return NextResponse.json({ error: 'No organization selected' }, { status: 400 });
  }

  const membership = await getMembership(orgId, auth.userId);
  if (!membership) {
    return NextResponse.json(
      { error: 'Not a member of this organization' },
      { status: 403 }
    );
  }

  return { ...auth, orgId, role: membership.role };
}

/** Like requireOrg, but also enforces the caller holds one of `roles`. */
export async function requireRole(
  request: NextRequest,
  roles: OrgRole[]
): Promise<OrgContext | NextResponse> {
  const ctx = await requireOrg(request);
  if (ctx instanceof NextResponse) return ctx;
  if (!roles.includes(ctx.role)) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }
  return ctx;
}

/**
 * Soft org resolution for backward-compatible scoping: returns the orgId if
 * the caller passed a valid x-org-id they belong to, otherwise null (callers
 * then fall back to userId scoping for legacy data).
 */
export async function resolveOrgId(
  request: NextRequest,
  userId: string
): Promise<string | null> {
  const orgId = request.headers.get('x-org-id') || '';
  if (!orgId) return null;
  const membership = await getMembership(orgId, userId);
  return membership ? orgId : null;
}
