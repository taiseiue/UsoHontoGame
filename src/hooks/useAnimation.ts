/**
 * useAnimation Hook
 * Feature: 009-apple-hig-ui-redesign - Phase 9: Micro-interactions
 * Hook for managing component animations and transitions
 */

'use client';

import { useEffect, useState, useRef, type RefObject } from 'react';

export interface AnimationOptions {
  /** Duration in milliseconds */
  duration?: number;
  /** Delay before animation starts */
  delay?: number;
  /** Easing function */
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  /** Number of iterations (Infinity for infinite) */
  iterations?: number;
}

/**
 * Hook to trigger animations on mount
 *
 * @param enabled - Whether animation is enabled
 * @returns Animation state (boolean)
 *
 * @example
 * ```tsx
 * const isAnimating = useAnimation(true);
 * return <div className={isAnimating ? 'animate-in' : ''}>{...}</div>
 * ```
 */
export function useAnimation(enabled = true): boolean {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (enabled) {
      // Trigger animation after mount
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [enabled]);

  return isAnimating;
}

/**
 * Hook for scroll-triggered animations
 *
 * @param ref - Element reference to observe
 * @param options - Intersection observer options
 * @returns Whether element is visible
 *
 * @example
 * ```tsx
 * const ref = useRef<HTMLDivElement>(null);
 * const isVisible = useScrollAnimation(ref);
 * return <div ref={ref} className={isVisible ? 'animate-in' : 'opacity-0'}>{...}</div>
 * ```
 */
export function useScrollAnimation<T extends HTMLElement>(
  ref: RefObject<T>,
  options?: IntersectionObserverInit
): boolean {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        // Optionally unobserve after first intersection
        observer.unobserve(element);
      }
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isVisible;
}

/**
 * Hook for hover animations
 *
 * @returns Hover state and handlers
 *
 * @example
 * ```tsx
 * const { isHovered, hoverProps } = useHoverAnimation();
 * return <div {...hoverProps} className={isHovered ? 'scale-105' : ''}>{...}</div>
 * ```
 */
export function useHoverAnimation() {
  const [isHovered, setIsHovered] = useState(false);

  return {
    isHovered,
    hoverProps: {
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
    },
  };
}

/**
 * Hook for focus animations
 *
 * @returns Focus state and handlers
 *
 * @example
 * ```tsx
 * const { isFocused, focusProps } = useFocusAnimation();
 * return <button {...focusProps} className={isFocused ? 'ring-2' : ''}>{...}</button>
 * ```
 */
export function useFocusAnimation() {
  const [isFocused, setIsFocused] = useState(false);

  return {
    isFocused,
    focusProps: {
      onFocus: () => setIsFocused(true),
      onBlur: () => setIsFocused(false),
    },
  };
}

/**
 * Hook for stagger animations
 *
 * @param count - Number of items to stagger
 * @param delay - Delay between each item (ms)
 * @returns Array of animation states
 *
 * @example
 * ```tsx
 * const itemStates = useStaggerAnimation(items.length, 100);
 * return items.map((item, i) => (
 *   <div key={i} className={itemStates[i] ? 'animate-in' : 'opacity-0'}>
 *     {item}
 *   </div>
 * ))
 * ```
 */
export function useStaggerAnimation(count: number, delay = 100): boolean[] {
  const [activeIndices, setActiveIndices] = useState<boolean[]>(new Array(count).fill(false));

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    for (let i = 0; i < count; i++) {
      const timer = setTimeout(() => {
        setActiveIndices((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, i * delay);
      timers.push(timer);
    }

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [count, delay]);

  return activeIndices;
}
