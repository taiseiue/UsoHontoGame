/**
 * TypeScript Type Contracts for Apple HIG Design System
 * Feature: 009-apple-hig-ui-redesign
 *
 * This file defines the TypeScript interfaces and types for the design system.
 * These types serve as contracts between components and ensure type safety.
 */

// ============================================================================
// Design Tokens
// ============================================================================

/**
 * Design token categories
 */
export type TokenCategory = 'color' | 'spacing' | 'typography' | 'shadow' | 'border';

/**
 * Design token definition
 */
export interface DesignToken {
  /** Token category */
  category: TokenCategory;
  /** CSS custom property name (e.g., '--color-primary') */
  name: string;
  /** Value in light mode */
  lightValue: string;
  /** Value in dark mode (required for colors/backgrounds) */
  darkValue?: string;
  /** Human-readable description */
  description?: string;
  /** Where this token should be used */
  usage?: string[];
}

/**
 * Design token collection organized by category
 */
export interface TokenCollection {
  colors: Record<string, DesignToken>;
  spacing: Record<string, DesignToken>;
  typography: Record<string, DesignToken>;
  shadows: Record<string, DesignToken>;
  borders: Record<string, DesignToken>;
}

// ============================================================================
// Theme System
// ============================================================================

/**
 * Theme mode options
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Effective theme (resolved from mode)
 */
export type EffectiveTheme = 'light' | 'dark';

/**
 * Theme preference state
 */
export interface ThemePreference {
  /** User's theme choice */
  mode: ThemeMode;
  /** Actual applied theme (resolved from system if mode='system') */
  effectiveTheme: EffectiveTheme;
  /** OS-level preference detected via media query */
  systemPreference: EffectiveTheme;
}

/**
 * Theme context value
 */
export interface ThemeContextValue {
  /** Current theme preference */
  theme: ThemeMode;
  /** Effective theme being applied */
  effectiveTheme: EffectiveTheme;
  /** Set theme mode */
  setTheme: (mode: ThemeMode) => void;
  /** Toggle between light and dark */
  toggleTheme: () => void;
}

// ============================================================================
// Component System
// ============================================================================

/**
 * Component size variants
 */
export type ComponentSize = 'small' | 'medium' | 'large';

/**
 * Component variant definition
 */
export interface ComponentVariant {
  /** Component name */
  component: string;
  /** Variant name (e.g., 'primary', 'secondary', 'danger') */
  variant: string;
  /** Size variant if applicable */
  size?: ComponentSize;
  /** Tailwind/CSS classes for this variant */
  classes: string;
  /** ARIA role if different from default */
  ariaRole?: string;
}

/**
 * Base props for all design system components
 */
export interface BaseComponentProps {
  /** Additional CSS classes */
  className?: string;
  /** Test ID for testing */
  testId?: string;
  /** ARIA label */
  ariaLabel?: string;
}

// ============================================================================
// Button Component
// ============================================================================

/**
 * Button variants
 */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

/**
 * Button props
 */
export interface ButtonProps extends BaseComponentProps {
  /** Button variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ComponentSize;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Button type */
  type?: 'button' | 'submit' | 'reset';
  /** Click handler */
  onClick?: () => void;
  /** Button content */
  children: React.ReactNode;
}

// ============================================================================
// Card Component
// ============================================================================

/**
 * Card variants
 */
export type CardVariant = 'default' | 'elevated' | 'outlined';

/**
 * Card props
 */
export interface CardProps extends BaseComponentProps {
  /** Card variant */
  variant?: CardVariant;
  /** Card padding */
  padding?: 'none' | 'small' | 'medium' | 'large';
  /** Clickable card */
  onClick?: () => void;
  /** Card content */
  children: React.ReactNode;
}

// ============================================================================
// Badge Component
// ============================================================================

/**
 * Badge variants (semantic colors)
 */
export type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

/**
 * Badge props
 */
export interface BadgeProps extends BaseComponentProps {
  /** Badge variant */
  variant?: BadgeVariant;
  /** Badge size */
  size?: ComponentSize;
  /** Badge content */
  children: React.ReactNode;
}

// ============================================================================
// Input Component
// ============================================================================

/**
 * Input types
 */
export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';

/**
 * Input props
 */
export interface InputProps extends BaseComponentProps {
  /** Input type */
  type?: InputType;
  /** Input value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Label text */
  label?: string;
  /** Required field */
  required?: boolean;
}

// ============================================================================
// Modal Component
// ============================================================================

/**
 * Modal props
 */
export interface ModalProps extends BaseComponentProps {
  /** Modal open state */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal size */
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  /** Modal content */
  children: React.ReactNode;
}

// ============================================================================
// Toast Component
// ============================================================================

/**
 * Toast variants
 */
export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast data
 */
export interface Toast {
  /** Unique ID */
  id: string;
  /** Toast variant */
  variant: ToastVariant;
  /** Toast message */
  message: string;
  /** Optional title */
  title?: string;
  /** Auto-dismiss duration in ms */
  duration?: number;
}

/**
 * Toast props
 */
export interface ToastProps extends BaseComponentProps {
  /** Toast data */
  toast: Toast;
  /** Close handler */
  onClose: (id: string) => void;
}

// ============================================================================
// Pagination Component
// ============================================================================

/**
 * Pagination state
 */
export interface PaginationState {
  /** Current page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Items per page (always 50) */
  itemsPerPage: 50;
  /** Total number of items */
  totalItems: number;
}

/**
 * Computed pagination properties
 */
export interface ComputedPagination extends PaginationState {
  /** Whether next page exists */
  hasNextPage: boolean;
  /** Whether previous page exists */
  hasPreviousPage: boolean;
  /** Start index of current page (0-indexed) */
  startIndex: number;
  /** End index of current page (exclusive) */
  endIndex: number;
}

/**
 * Pagination props
 */
export interface PaginationProps extends BaseComponentProps {
  /** Current page */
  currentPage: number;
  /** Total pages */
  totalPages: number;
  /** Page change handler */
  onPageChange: (page: number) => void;
  /** Total items (for display) */
  totalItems?: number;
}

// ============================================================================
// Skeleton Component (Loading States)
// ============================================================================

/**
 * Skeleton variants
 */
export type SkeletonVariant = 'text' | 'circular' | 'rectangular';

/**
 * Skeleton props
 */
export interface SkeletonProps extends BaseComponentProps {
  /** Skeleton variant */
  variant?: SkeletonVariant;
  /** Width (CSS value) */
  width?: string | number;
  /** Height (CSS value) */
  height?: string | number;
  /** Animation enabled */
  animated?: boolean;
}

// ============================================================================
// Responsive Breakpoints
// ============================================================================

/**
 * Breakpoint names
 */
export type BreakpointName = 'mobile' | 'tablet' | 'desktop';

/**
 * Breakpoint configuration
 */
export interface BreakpointConfig {
  /** Breakpoint name */
  name: BreakpointName;
  /** Minimum width in pixels */
  minWidth: number;
  /** Maximum width in pixels (omit for largest) */
  maxWidth?: number;
  /** Default grid columns */
  columns: number;
}

/**
 * Breakpoint constants
 */
export const BREAKPOINTS: Record<BreakpointName, BreakpointConfig> = {
  mobile: { name: 'mobile', minWidth: 0, maxWidth: 767, columns: 1 },
  tablet: { name: 'tablet', minWidth: 768, maxWidth: 1023, columns: 2 },
  desktop: { name: 'desktop', minWidth: 1024, columns: 3 },
};

// ============================================================================
// Animation System
// ============================================================================

/**
 * Animation duration categories
 */
export type AnimationDuration = 'fast' | 'medium' | 'slow';

/**
 * Animation easing types
 */
export type AnimationEasing = 'default' | 'ease-in' | 'ease-out';

/**
 * Animation preset
 */
export interface AnimationPreset {
  /** Animation name */
  name: string;
  /** Duration category */
  duration: AnimationDuration;
  /** Easing curve */
  easing: AnimationEasing;
  /** CSS properties to animate */
  properties: string[];
  /** CSS keyframes definition */
  keyframes?: string;
}

/**
 * Animation duration values (in ms)
 */
export const ANIMATION_DURATIONS: Record<AnimationDuration, number> = {
  fast: 200,
  medium: 300,
  slow: 500,
};

/**
 * Easing curve values
 */
export const EASING_CURVES: Record<AnimationEasing, string> = {
  default: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
  'ease-in': 'cubic-bezier(0.4, 0.0, 1.0, 1.0)',
  'ease-out': 'cubic-bezier(0.0, 0.0, 0.2, 1.0)',
};

// ============================================================================
// Accessibility
// ============================================================================

/**
 * Font size preferences
 */
export type FontSizePreference = 'default' | 'large' | 'xlarge';

/**
 * Accessibility profile
 */
export interface AccessibilityProfile {
  /** User prefers reduced motion */
  reducedMotion: boolean;
  /** User prefers high contrast */
  highContrast: boolean;
  /** Font size preference */
  fontSize: FontSizePreference;
  /** User is navigating via keyboard */
  keyboardNavigation: boolean;
  /** Screen reader detected (best effort) */
  screenReaderActive?: boolean;
}

/**
 * Accessibility context value
 */
export interface AccessibilityContextValue {
  /** Accessibility profile */
  profile: AccessibilityProfile;
  /** Update profile */
  updateProfile: (partial: Partial<AccessibilityProfile>) => void;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * CSS custom property name
 */
export type CSSCustomProperty = `--${string}`;

/**
 * Tailwind CSS class string
 */
export type TailwindClass = string;

/**
 * Color value (hex, rgb, hsl, or CSS variable)
 */
export type ColorValue = string;

/**
 * Spacing value (px, rem, em, or CSS variable)
 */
export type SpacingValue = string | number;

/**
 * Shadow value (CSS box-shadow)
 */
export type ShadowValue = string;
