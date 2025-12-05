/**
 * useMediaQuery Hook
 * Feature: 009-apple-hig-ui-redesign - Phase 8: Responsive Design
 * React hook for media query matching
 */

'use client';

import { useEffect, useState } from 'react';
import { type Breakpoint, getMediaQuery } from '@/lib/responsive/breakpoints';

/**
 * Hook to match media queries
 *
 * @param query - Media query string or breakpoint name
 * @returns Boolean indicating if the query matches
 *
 * @example
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const isLargeScreen = useMediaQuery('lg');
 * ```
 */
export function useMediaQuery(query: string | Breakpoint): boolean {
  const mediaQuery = query.startsWith('(') ? query : getMediaQuery(query as Breakpoint);

  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(mediaQuery).matches;
  });

  useEffect(() => {
    const mediaQueryList = window.matchMedia(mediaQuery);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Set initial value
    setMatches(mediaQueryList.matches);

    // Modern browsers
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', handleChange);
      return () => mediaQueryList.removeEventListener('change', handleChange);
    }
    // Legacy browsers
    else {
      mediaQueryList.addListener(handleChange);
      return () => mediaQueryList.removeListener(handleChange);
    }
  }, [mediaQuery]);

  return matches;
}

/**
 * Hook to get current breakpoint
 *
 * @returns Current breakpoint name
 *
 * @example
 * ```tsx
 * const breakpoint = useBreakpoint();
 * if (breakpoint === 'lg') {
 *   // Desktop layout
 * }
 * ```
 */
export function useBreakpoint(): Breakpoint | null {
  const [breakpoint, setBreakpoint] = useState<Breakpoint | null>(() => {
    if (typeof window === 'undefined') return null;

    const width = window.innerWidth;
    if (width >= 1536) return '2xl';
    if (width >= 1280) return 'xl';
    if (width >= 1024) return 'lg';
    if (width >= 768) return 'md';
    if (width >= 640) return 'sm';
    return null;
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1536) setBreakpoint('2xl');
      else if (width >= 1280) setBreakpoint('xl');
      else if (width >= 1024) setBreakpoint('lg');
      else if (width >= 768) setBreakpoint('md');
      else if (width >= 640) setBreakpoint('sm');
      else setBreakpoint(null);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
}
