/**
 * Responsive Breakpoints
 * Feature: 009-apple-hig-ui-redesign - Phase 8: Responsive Design
 * Define and manage responsive breakpoints
 */

/**
 * Standard breakpoint values (matches Tailwind defaults)
 */
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

/**
 * Get media query string for a breakpoint
 *
 * @example
 * ```tsx
 * const query = getMediaQuery('md'); // '(min-width: 768px)'
 * ```
 */
export function getMediaQuery(breakpoint: Breakpoint): string {
  return `(min-width: ${breakpoints[breakpoint]}px)`;
}

/**
 * Check if current viewport matches a breakpoint
 *
 * @example
 * ```tsx
 * if (matchesBreakpoint('lg')) {
 *   // Desktop layout
 * }
 * ```
 */
export function matchesBreakpoint(breakpoint: Breakpoint): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(getMediaQuery(breakpoint)).matches;
}

/**
 * Get current breakpoint
 *
 * @example
 * ```tsx
 * const current = getCurrentBreakpoint(); // 'md'
 * ```
 */
export function getCurrentBreakpoint(): Breakpoint | null {
  if (typeof window === 'undefined') return null;

  const width = window.innerWidth;
  const breakpointEntries = Object.entries(breakpoints) as [Breakpoint, number][];

  // Find largest matching breakpoint
  for (let i = breakpointEntries.length - 1; i >= 0; i--) {
    const [name, value] = breakpointEntries[i];
    if (width >= value) {
      return name;
    }
  }

  return null;
}
