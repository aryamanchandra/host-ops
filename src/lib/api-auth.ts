import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth';

export interface AuthContext {
  userId: string;
  username: string;
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
