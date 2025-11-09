/**
 * HTTP Client for Integration API Tests
 *
 * Provides utilities to make actual HTTP requests to Next.js API routes
 * This replaces the direct route function imports with real HTTP calls
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

export interface HttpRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
}

/**
 * Make an HTTP request to the API
 */
export async function httpRequest(options: HttpRequestOptions): Promise<Response> {
  const { method, path, body, headers = {} } = options;

  const url = `${BASE_URL}${path}`;

  const requestInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    requestInit.body = JSON.stringify(body);
  }

  const response = await fetch(url, requestInit);
  return response;
}

/**
 * Parse JSON response
 */
export async function parseResponse(response: Response) {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Convenience methods for HTTP verbs
 */
export const http = {
  get: (path: string, headers?: Record<string, string>) =>
    httpRequest({ method: 'GET', path, headers }),

  post: (path: string, body?: unknown, headers?: Record<string, string>) =>
    httpRequest({ method: 'POST', path, body, headers }),

  put: (path: string, body?: unknown, headers?: Record<string, string>) =>
    httpRequest({ method: 'PUT', path, body, headers }),

  delete: (path: string, headers?: Record<string, string>) =>
    httpRequest({ method: 'DELETE', path, headers }),

  patch: (path: string, body?: unknown, headers?: Record<string, string>) =>
    httpRequest({ method: 'PATCH', path, body, headers }),
};
