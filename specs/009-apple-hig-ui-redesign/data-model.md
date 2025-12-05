# Data Model: Apple HIG-Based UI Redesign

**Feature**: 009-apple-hig-ui-redesign
**Date**: 2025-12-02
**Status**: Complete

## Overview

This document defines the data structures for the design system. Note that this is primarily a **UI redesign feature** with no changes to backend data models (Game, Session, Episode, etc. remain unchanged). The entities defined here are frontend-only constructs for managing design system state and configuration.

---

## 1. Design Token

Represents a design system variable (color, spacing, typography value) with metadata.

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `category` | `'color' \| 'spacing' \| 'typography' \| 'shadow' \| 'border'` | ✅ | Token category |
| `name` | `string` | ✅ | CSS custom property name (e.g., `--color-primary`) |
| `lightValue` | `string` | ✅ | Value in light mode |
| `darkValue` | `string` | ⚠️ | Value in dark mode (required only for colors/backgrounds) |
| `description` | `string` | ❌ | Human-readable description |
| `usage` | `string[]` | ❌ | Where this token should be used |

### Example

```typescript
{
  category: 'color',
  name: '--color-primary',
  lightValue: '#007AFF',
  darkValue: '#0A84FF',
  description: 'Primary action color',
  usage: ['buttons', 'links', 'active states']
}
```

### Storage

- Defined in CSS files: `src/styles/tokens/*.css`
- Exported as TypeScript types: `src/lib/design-system/tokens.ts`

---

## 2. Theme Preference

Represents user's theme (dark mode) preference.

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `mode` | `'light' \| 'dark' \| 'system'` | ✅ | User's theme choice |
| `effectiveTheme` | `'light' \| 'dark'` | ✅ | Actual applied theme (resolved from system if mode='system') |
| `systemPreference` | `'light' \| 'dark'` | ✅ | OS-level preference detected via media query |

### State Management

- Stored in: `localStorage` key `'theme-preference'`
- Managed by: `useTheme()` hook in `src/lib/design-system/useTheme.ts`
- Persisted: Across browser sessions
- Synchronized: Applied via `data-theme` attribute on `<html>` element

### Validation Rules

- `mode` defaults to `'system'` on first visit
- `effectiveTheme` computed from `mode` and `systemPreference`
- Changes to `mode` immediately update `effectiveTheme` and DOM

### Lifecycle

1. **Initial load**: Read from localStorage or default to 'system'
2. **System change detection**: Listen to `prefers-color-scheme` media query
3. **User override**: Update localStorage and apply immediately
4. **Re-compute**: `effectiveTheme` recalculated when mode or system changes

---

## 3. Component Variant

Represents a variation of a reusable UI component.

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `component` | `string` | ✅ | Component name (e.g., 'Button', 'Card') |
| `variant` | `string` | ✅ | Variant name (e.g., 'primary', 'secondary', 'danger') |
| `size` | `'small' \| 'medium' \| 'large'` | ❌ | Size variant if applicable |
| `classes` | `string` | ✅ | Tailwind/CSS classes for this variant |
| `ariaRole` | `string` | ❌ | ARIA role if different from default |

### Example

```typescript
{
  component: 'Button',
  variant: 'primary',
  size: 'large',
  classes: 'bg-blue-600 text-white hover:bg-blue-700 h-11 px-4 rounded-lg',
  ariaRole: 'button'
}
```

### Usage

Component variants are encoded directly in component implementations:

```typescript
// src/components/ui/Button/Button.tsx
const variantClasses = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

const sizeClasses = {
  small: 'h-7 px-2 text-sm',
  medium: 'h-9 px-3',
  large: 'h-11 px-4',
};
```

---

## 4. Breakpoint Configuration

Represents responsive design breakpoint thresholds.

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `'mobile' \| 'tablet' \| 'desktop'` | ✅ | Breakpoint name |
| `minWidth` | `number` | ✅ | Minimum width in pixels |
| `maxWidth` | `number` | ❌ | Maximum width in pixels (omit for largest breakpoint) |
| `columns` | `number` | ✅ | Default grid columns for this breakpoint |

### Constants

```typescript
export const BREAKPOINTS = {
  mobile: { minWidth: 0, maxWidth: 767, columns: 1 },
  tablet: { minWidth: 768, maxWidth: 1023, columns: 2 },
  desktop: { minWidth: 1024, columns: 3 },
} as const;
```

### Media Queries

Generated from breakpoints:

```typescript
export const mediaQueries = {
  mobile: '@media (max-width: 767px)',
  tablet: '@media (min-width: 768px) and (max-width: 1023px)',
  desktop: '@media (min-width: 1024px)',
};
```

---

## 5. Animation Preset

Represents predefined animation configuration.

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | ✅ | Animation name (e.g., 'fadeIn', 'slideUp') |
| `duration` | `'fast' \| 'medium' \| 'slow'` | ✅ | Animation duration category |
| `easing` | `'default' \| 'ease-in' \| 'ease-out'` | ✅ | Easing curve type |
| `properties` | `string[]` | ✅ | CSS properties to animate |
| `keyframes` | `string` | ❌ | CSS keyframes definition |

### Example

```typescript
{
  name: 'fadeIn',
  duration: 'medium', // 300ms
  easing: 'ease-out',
  properties: ['opacity'],
  keyframes: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `
}
```

### Usage

Animation presets referenced in component styles:

```css
.modal-enter {
  animation: fadeIn var(--duration-medium) var(--ease-out);
}
```

---

## 6. Pagination State

Represents pagination configuration and current state.

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `currentPage` | `number` | ✅ | Current page (1-indexed) |
| `totalPages` | `number` | ✅ | Total number of pages |
| `itemsPerPage` | `number` | ✅ | Fixed at 50 items per page |
| `totalItems` | `number` | ✅ | Total number of items across all pages |
| `hasNextPage` | `boolean` | ✅ | Whether next page exists |
| `hasPreviousPage` | `boolean` | ✅ | Whether previous page exists |

### Validation Rules

- `currentPage` must be ≥1 and ≤ `totalPages`
- `itemsPerPage` is always 50 (constant)
- `totalPages` computed as `Math.ceil(totalItems / itemsPerPage)`
- `hasNextPage` computed as `currentPage < totalPages`
- `hasPreviousPage` computed as `currentPage > 1`

### State Management

```typescript
interface PaginationState {
  currentPage: number;
  totalPages: number;
  itemsPerPage: 50; // constant
  totalItems: number;
}

// Computed properties
const hasNextPage = currentPage < totalPages;
const hasPreviousPage = currentPage > 1;
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
```

### URL Synchronization

- Pagination state synced to URL query parameter: `?page=3`
- Enables bookmarking and sharing specific pages
- On page load, read `page` param and validate against `totalPages`

---

## 7. Accessibility Profile

Represents user's accessibility preferences and settings.

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reducedMotion` | `boolean` | ✅ | User prefers reduced motion |
| `highContrast` | `boolean` | ✅ | User prefers high contrast |
| `fontSize` | `'default' \| 'large' \| 'xlarge'` | ✅ | Font size preference |
| `keyboardNavigation` | `boolean` | ✅ | User is navigating via keyboard |
| `screenReaderActive` | `boolean` | ❌ | Screen reader detected (best effort) |

### Detection

Accessibility preferences detected via:

```typescript
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const highContrast = window.matchMedia('(prefers-contrast: high)').matches;
const fontSize = document.documentElement.style.fontSize; // Read from system
```

### Application

- **Reduced motion**: Disable/simplify animations
- **High contrast**: Use higher contrast color tokens
- **Font size**: Apply CSS scaling
- **Keyboard nav**: Show focus indicators prominently
- **Screen reader**: Add ARIA live regions, descriptive labels

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│ User Preferences (localStorage)                      │
│ - theme-preference: 'light' | 'dark' | 'system'    │
└─────────────────┬───────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────┐
│ ThemeProvider (React Context)                       │
│ - Manages Theme Preference state                    │
│ - Listens to system preference changes              │
│ - Applies data-theme to <html>                      │
└─────────────────┬───────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────┐
│ CSS Custom Properties (Design Tokens)               │
│ :root { --color-primary: #007AFF; }                 │
│ [data-theme="dark"] { --color-primary: #0A84FF; }   │
└─────────────────┬───────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────┐
│ UI Components (src/components/ui/)                  │
│ - Consume design tokens via CSS variables           │
│ - Apply appropriate component variants              │
│ - Respect accessibility preferences                 │
└─────────────────────────────────────────────────────┘
```

---

## Relationships

1. **Design Tokens → Components**: Components reference tokens via CSS variables
2. **Theme Preference → Design Tokens**: Theme mode determines which token values are active
3. **Accessibility Profile → Components**: Components adapt behavior based on user preferences
4. **Pagination State → List Components**: Lists consume pagination state for rendering controls
5. **Component Variants → Components**: Each component supports multiple variants/sizes
6. **Breakpoint Configuration → Components**: Components adapt layout based on viewport breakpoint

---

## Summary

All data models defined for the design system:

1. **Design Token**: CSS custom property definitions
2. **Theme Preference**: User's dark mode choice
3. **Component Variant**: Styling variations for components
4. **Breakpoint Configuration**: Responsive breakpoint thresholds
5. **Animation Preset**: Reusable animation definitions
6. **Pagination State**: Pagination configuration and current page
7. **Accessibility Profile**: User accessibility preferences

**Key Insight**: This is a UI-focused feature with no backend data model changes. All entities are frontend state management constructs.

**Status**: ✅ Data model complete. Ready for contracts generation.
