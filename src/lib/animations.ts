/**
 * Animation utilities for enhanced UI feedback
 * Feature: Enhanced status transition feedback
 */

export type AnimationType = 'success' | 'error' | 'loading' | 'pulse' | 'bounce';

/**
 * CSS animation classes for different states
 */
export const animations = {
  // Success animations
  success: {
    button: 'transition-all duration-300 bg-green-600 hover:bg-green-700 scale-105',
    icon: 'animate-pulse text-green-600',
    badge: 'transition-all duration-500 animate-pulse',
    container: 'animate-bounce-in',
  },

  // Error animations
  error: {
    button: 'transition-all duration-300 bg-red-600 hover:bg-red-700 animate-shake',
    icon: 'animate-pulse text-red-600',
    badge: 'transition-all duration-500 animate-pulse',
    container: 'animate-shake',
  },

  // Loading animations
  loading: {
    button: 'transition-all duration-200 opacity-75 cursor-not-allowed',
    spinner: 'animate-spin',
    pulse: 'animate-pulse',
    progress: 'animate-progress',
  },

  // Status badge transitions
  statusTransition: {
    fadeOut: 'transition-opacity duration-300 opacity-0',
    fadeIn: 'transition-opacity duration-300 opacity-100',
    highlight: 'transition-all duration-1000 ring-4 ring-blue-300 ring-opacity-50',
  },

  // Toast animations
  toast: {
    slideIn: 'animate-slide-in-right',
    slideOut: 'animate-slide-out-right',
    fadeIn: 'animate-fade-in',
    fadeOut: 'animate-fade-out',
  },
} as const;

/**
 * Custom Tailwind animations (to be added to tailwind.config.js)
 */
export const customAnimations = {
  '@keyframes bounce-in': {
    '0%': { transform: 'scale(0.9)', opacity: '0' },
    '50%': { transform: 'scale(1.05)', opacity: '0.8' },
    '100%': { transform: 'scale(1)', opacity: '1' },
  },

  '@keyframes shake': {
    '0%, 100%': { transform: 'translateX(0)' },
    '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
    '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
  },

  '@keyframes slide-in-right': {
    '0%': { transform: 'translateX(100%)', opacity: '0' },
    '100%': { transform: 'translateX(0)', opacity: '1' },
  },

  '@keyframes slide-out-right': {
    '0%': { transform: 'translateX(0)', opacity: '1' },
    '100%': { transform: 'translateX(100%)', opacity: '0' },
  },

  '@keyframes fade-in': {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },

  '@keyframes fade-out': {
    '0%': { opacity: '1' },
    '100%': { opacity: '0' },
  },

  '@keyframes progress': {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(100%)' },
  },
};

/**
 * Animation utility functions
 */
export const animationUtils = {
  /**
   * Add temporary animation class and remove it after duration
   */
  addTemporaryClass: (
    element: HTMLElement,
    className: string,
    duration: number = 1000
  ): Promise<void> => {
    return new Promise((resolve) => {
      element.classList.add(className);
      setTimeout(() => {
        element.classList.remove(className);
        resolve();
      }, duration);
    });
  },

  /**
   * Create a success feedback sequence
   */
  playSuccessFeedback: async (element: HTMLElement): Promise<void> => {
    await animationUtils.addTemporaryClass(element, 'animate-bounce-in', 600);
    await animationUtils.addTemporaryClass(element, animations.statusTransition.highlight, 2000);
  },

  /**
   * Create an error feedback sequence
   */
  playErrorFeedback: async (element: HTMLElement): Promise<void> => {
    await animationUtils.addTemporaryClass(element, 'animate-shake', 600);
  },

  /**
   * Smooth status badge transition
   */
  transitionStatusBadge: async (element: HTMLElement): Promise<void> => {
    // Fade out
    element.classList.add(animations.statusTransition.fadeOut);
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Update content happens here (external)

    // Fade in with highlight
    element.classList.remove(animations.statusTransition.fadeOut);
    element.classList.add(animations.statusTransition.fadeIn);
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Temporary highlight
    await animationUtils.addTemporaryClass(element, animations.statusTransition.highlight, 2000);
  },

  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion: (): boolean => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Conditionally apply animation based on user preferences
   */
  conditionalAnimation: (
    element: HTMLElement,
    className: string,
    duration: number = 1000
  ): Promise<void> => {
    if (animationUtils.prefersReducedMotion()) {
      return Promise.resolve();
    }
    return animationUtils.addTemporaryClass(element, className, duration);
  },
};

/**
 * Predefined animation sequences for common UI patterns
 */
export const animationSequences = {
  buttonSuccess: async (buttonElement: HTMLElement): Promise<void> => {
    if (!animationUtils.prefersReducedMotion()) {
      await animationUtils.addTemporaryClass(buttonElement, 'scale-105 bg-green-600', 800);
    }
  },

  buttonError: async (buttonElement: HTMLElement): Promise<void> => {
    if (!animationUtils.prefersReducedMotion()) {
      await animationUtils.addTemporaryClass(buttonElement, 'animate-shake', 600);
    }
  },

  statusBadgeUpdate: async (
    badgeElement: HTMLElement,
    onContentUpdate: () => void
  ): Promise<void> => {
    if (animationUtils.prefersReducedMotion()) {
      onContentUpdate();
      return;
    }

    // Fade out
    badgeElement.classList.add(animations.statusTransition.fadeOut);
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Update content
    onContentUpdate();

    // Fade in
    badgeElement.classList.remove(animations.statusTransition.fadeOut);
    badgeElement.classList.add(animations.statusTransition.fadeIn);
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Highlight
    await animationUtils.addTemporaryClass(
      badgeElement,
      animations.statusTransition.highlight,
      2000
    );
  },
};

/**
 * Confetti animation utilities for celebration effects
 * Feature: 006-results-dashboard, User Story 3
 */

export interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  velocity: { x: number; y: number };
}

/**
 * Generate random confetti particles for celebration animation
 */
export function generateConfettiParticles(count: number): ConfettiParticle[] {
  const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8dadc', '#f1faee', '#95e1d3', '#ff9ff3'];
  const particles: ConfettiParticle[] = [];

  for (let i = 0; i < count; i++) {
    particles.push({
      id: i,
      x: Math.random() * 100,
      y: -10,
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      velocity: {
        x: (Math.random() - 0.5) * 2,
        y: 1 + Math.random() * 2,
      },
    });
  }

  return particles;
}
