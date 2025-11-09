import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Host Authorization Middleware Utility
 * Validates that the requester is the host of the session
 */

export interface AuthContext {
  sessionId: string;
  hostId: string;
}

/**
 * Verify host authorization by checking if the provided hostId matches the session's host
 */
export async function verifyHostAuthorization(
  _sessionId: string,
  providedHostId: string,
  sessionHostId: string
): Promise<{ authorized: boolean; error?: string }> {
  if (!providedHostId) {
    return {
      authorized: false,
      error: 'Host ID is required',
    };
  }

  if (providedHostId !== sessionHostId) {
    return {
      authorized: false,
      error: 'Unauthorized: You are not the host of this session',
    };
  }

  return { authorized: true };
}

/**
 * Middleware helper to extract and validate host credentials from request
 */
export function extractHostCredentials(
  request: NextRequest,
  body?: Record<string, unknown>
): { hostId: string | null; error?: string } {
  // Try to get hostId from request body
  const hostId = body?.hostId as string | undefined;

  // Try to get hostId from query parameter as fallback
  const queryHostId = request.nextUrl.searchParams.get('hostId');

  const resolvedHostId = hostId || queryHostId;

  if (!resolvedHostId) {
    return {
      hostId: null,
      error: 'Host ID is required',
    };
  }

  return { hostId: resolvedHostId };
}

/**
 * Create unauthorized response
 */
export function unauthorizedResponse(message = 'Unauthorized'): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 });
}

/**
 * Create forbidden response
 */
export function forbiddenResponse(message = 'Forbidden'): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}
