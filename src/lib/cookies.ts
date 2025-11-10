// Cookie helper functions
// Utilities for working with cookies in Next.js

import { cookies } from 'next/headers';
import { COOKIE_CONFIG } from './constants';

/**
 * Get a cookie value by name
 * @param name Cookie name
 * @returns Cookie value or null if not found
 */
export async function getCookie(name: string): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(name);
  return cookie?.value ?? null;
}

/**
 * Set a cookie with standard configuration
 * @param name Cookie name
 * @param value Cookie value
 * @param options Additional cookie options
 */
export async function setCookie(
  name: string,
  value: string,
  options: {
    httpOnly?: boolean;
    secure?: boolean;
    maxAge?: number;
    path?: string;
    sameSite?: 'strict' | 'lax' | 'none';
  } = {}
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(name, value, {
    httpOnly: options.httpOnly ?? false,
    secure: options.secure ?? process.env.NODE_ENV === 'production',
    sameSite: options.sameSite ?? COOKIE_CONFIG.SAME_SITE,
    maxAge: options.maxAge ?? COOKIE_CONFIG.MAX_AGE,
    path: options.path ?? COOKIE_CONFIG.PATH,
  });
}

/**
 * Delete a cookie by name
 * @param name Cookie name
 */
export async function deleteCookie(name: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(name);
}
