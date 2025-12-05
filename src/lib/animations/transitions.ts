/**
 * Animation Transitions
 * Feature: 009-apple-hig-ui-redesign - Phase 9: Micro-interactions
 * Predefined animation transitions for smooth interactions
 */

import { classNames } from '@/lib/design-system/classNames';

/**
 * Transition duration presets
 */
export const durations = {
  fast: 'duration-150',
  normal: 'duration-200',
  slow: 'duration-300',
  slower: 'duration-500',
} as const;

/**
 * Transition timing functions
 */
export const easings = {
  linear: 'ease-linear',
  in: 'ease-in',
  out: 'ease-out',
  inOut: 'ease-in-out',
} as const;

/**
 * Fade animations
 */
export const fade = {
  in: classNames(
    'transition-opacity',
    durations.normal,
    easings.inOut,
    'opacity-0 animate-in fade-in'
  ),
  out: classNames(
    'transition-opacity',
    durations.normal,
    easings.inOut,
    'opacity-100 animate-out fade-out'
  ),
};

/**
 * Slide animations
 */
export const slide = {
  up: classNames(
    'transition-transform',
    durations.normal,
    easings.out,
    'translate-y-2 animate-in slide-in-from-bottom'
  ),
  down: classNames(
    'transition-transform',
    durations.normal,
    easings.out,
    '-translate-y-2 animate-in slide-in-from-top'
  ),
  left: classNames(
    'transition-transform',
    durations.normal,
    easings.out,
    'translate-x-2 animate-in slide-in-from-right'
  ),
  right: classNames(
    'transition-transform',
    durations.normal,
    easings.out,
    '-translate-x-2 animate-in slide-in-from-left'
  ),
};

/**
 * Scale animations
 */
export const scale = {
  in: classNames(
    'transition-transform',
    durations.normal,
    easings.out,
    'scale-95 animate-in zoom-in'
  ),
  out: classNames(
    'transition-transform',
    durations.normal,
    easings.in,
    'scale-100 animate-out zoom-out'
  ),
};

/**
 * Combined entrance animations
 */
export const entrance = {
  fadeIn: fade.in,
  fadeInUp: classNames(fade.in, slide.up),
  fadeInDown: classNames(fade.in, slide.down),
  fadeInLeft: classNames(fade.in, slide.left),
  fadeInRight: classNames(fade.in, slide.right),
  scaleIn: classNames(fade.in, scale.in),
};

/**
 * Combined exit animations
 */
export const exit = {
  fadeOut: fade.out,
  fadeOutUp: classNames(fade.out, 'translate-y-[-8px]'),
  fadeOutDown: classNames(fade.out, 'translate-y-2'),
  scaleOut: classNames(fade.out, scale.out),
};

/**
 * Hover animations
 */
export const hover = {
  lift: classNames('transition-transform', durations.fast, 'hover:-translate-y-1'),
  grow: classNames('transition-transform', durations.fast, 'hover:scale-105'),
  shrink: classNames('transition-transform', durations.fast, 'hover:scale-95'),
  brightness: classNames('transition-all', durations.fast, 'hover:brightness-110'),
};

/**
 * Loading animations
 */
export const loading = {
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
};
