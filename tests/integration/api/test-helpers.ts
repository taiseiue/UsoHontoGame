/**
 * Integration test helpers for API routes
 *
 * Provides utilities to test Next.js API routes in integration tests
 */

import type { NextRequest } from 'next/server';

/**
 * Create a mock NextRequest for testing API routes
 */
export function createMockRequest(
  method: string,
  url: string,
  options?: {
    body?: unknown;
    headers?: Record<string, string>;
  }
): NextRequest {
  const requestInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  };

  if (options?.body) {
    requestInit.body = JSON.stringify(options.body);
  }

  return new Request(url, requestInit) as NextRequest;
}

/**
 * Parse JSON response from API route
 */
export async function parseResponse(response: Response) {
  const text = await response.text();
  if (!text) {
    return null;
  }
  return JSON.parse(text);
}

/**
 * Create a test session with a host
 */
export interface TestSession {
  sessionId: string;
  hostId: string;
}

/**
 * Helper to clear in-memory repositories between tests
 */
export function clearRepositories() {
  // In-memory repositories are singletons, so we need to clear their state
  // This is handled by the repositories themselves in their clear() methods
}
