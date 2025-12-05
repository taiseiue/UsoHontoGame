# Research: Apple HIG-Based UI Redesign

**Feature**: 009-apple-hig-ui-redesign
**Date**: 2025-12-02
**Status**: Complete

## Research Overview

This document consolidates research findings for implementing a comprehensive UI redesign based on Apple's Human Interface Guidelines. All technical unknowns from the planning phase have been resolved.

---

## 1. CSS Custom Properties for Design Tokens

### Decision
Use CSS custom properties (CSS variables) as the primary mechanism for design tokens, organized in separate files by category in `src/styles/tokens/`.

### Rationale
- **Runtime switching**: Essential for dark mode toggle without page reload
- **Browser support**: Universal support in modern browsers (98%+ compatibility)
- **Performance**: No build step needed, native browser feature
- **Maintainability**: Easy to update values, inspect in DevTools
- **Cascade**: Natural CSS cascade allows theme scoping (`:root`, `[data-theme="dark"]`)
- **Compatibility**: Works seamlessly with Tailwind CSS utility classes

### Implementation Pattern
```css
/* src/styles/tokens/colors.css */
:root {
  --color-primary: #007AFF;
  --color-success: #34C759;
  --color-error: #FF3B30;
  --bg-primary: #FFFFFF;
  --text-primary: #000000;
}

[data-theme="dark"] {
  --bg-primary: #1C1C1E;
  --text-primary: #FFFFFF;
}
```

### Alternatives Considered
- **Tailwind config only**: Rejected because doesn't support runtime dark mode toggle
- **TypeScript constants**: Rejected because requires JS execution, no runtime switching
- **SCSS variables**: Rejected because requires build step, not runtime dynamic

---

## 2. Dark Mode Implementation Strategy

### Decision
System preference detection with user override capability, persisted in localStorage.

### Rationale
- **Apple HIG alignment**: Recommended pattern in Apple's guidelines
- **User autonomy**: Respects system preference but allows override
- **Persistence**: User choice remembered across sessions
- **Accessibility**: Supports users with light sensitivity or preference
- **Performance**: No server round-trip needed for theme switching

### Implementation Pattern
```typescript
// src/lib/design-system/useTheme.ts
export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    const stored = localStorage.getItem('theme-preference');
    if (stored) setTheme(stored);
  }, []);

  const effectiveTheme = theme === 'system'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    : theme;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', effectiveTheme);
  }, [effectiveTheme]);

  return { theme, setTheme, effectiveTheme };
}
```

### Best Practices
- Use `prefers-color-scheme` media query for system detection
- Apply theme via `data-theme` attribute on `<html>` element
- Provide three options: Light, Dark, System
- Icon in header for quick access (sun/moon symbol)
- Smooth transition between themes (CSS `transition` on colors)

---

## 3. San Francisco Font Implementation

### Decision
Use system font stack with San Francisco as priority, graceful fallbacks.

### Rationale
- **Zero download**: San Francisco pre-installed on Apple devices
- **Performance**: No web font loading delay
- **Consistency**: Matches OS typography on Apple platforms
- **Accessibility**: System fonts respect OS-level font size preferences
- **Cross-platform**: Fallbacks ensure good experience on all platforms

### Implementation Pattern
```css
/* src/styles/tokens/typography.css */
:root {
  --font-family-base: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                      "Helvetica Neue", Arial, sans-serif;
  --font-size-display: 28px;
  --font-size-title: 22px;
  --font-size-body: 16px;
  --font-size-caption: 14px;
  --font-size-small: 12px;
  --font-weight-regular: 400;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
}
```

### Font Loading Strategy
- No web fonts needed
- System font stack provides instant rendering
- Fallback order: San Francisco → Segoe UI (Windows) → Roboto (Android) → Helvetica/Arial

---

## 4. Animation and Easing Curves

### Decision
Use Apple-standard cubic-bezier easing functions for all animations.

### Rationale
- **Brand consistency**: Matches animations users expect from Apple products
- **Perceived performance**: Proper easing makes interfaces feel responsive
- **Accessibility**: Supports `prefers-reduced-motion` for users with vestibular disorders
- **Subtlety**: Apple curves are designed to be unobtrusive

### Implementation Pattern
```css
/* src/styles/tokens/animations.css */
:root {
  /* Easing curves */
  --ease-default: cubic-bezier(0.25, 0.1, 0.25, 1.0);
  --ease-out: cubic-bezier(0.0, 0.0, 0.2, 1.0);
  --ease-in: cubic-bezier(0.4, 0.0, 1.0, 1.0);

  /* Durations */
  --duration-fast: 200ms;
  --duration-medium: 300ms;
  --duration-slow: 500ms;
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Animation Guidelines
- **Hover effects**: 200ms with ease-default
- **Page transitions**: 300ms with ease-out
- **Loading states**: 500ms with ease-default
- **Micro-interactions**: 200ms with ease-in for exit, ease-out for enter

---

## 5. Responsive Breakpoint Strategy

### Decision
Three breakpoints: Mobile (<768px), Tablet (768-1023px), Desktop (≥1024px).

### Rationale
- **Simplicity**: Three breakpoints cover 95% of devices
- **Apple ecosystem**: Aligns with iPhone, iPad, Mac screen sizes
- **Maintenance**: Fewer breakpoints = easier to maintain
- **Performance**: Less CSS, faster parsing

### Implementation Pattern
```css
/* Mobile-first approach */
.container {
  padding: 16px;
  max-width: 100%;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 24px;
    max-width: 768px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: 32px;
    max-width: 1200px;
  }
}
```

### Grid Strategy
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3 columns
- Use CSS Grid with `grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))`

---

## 6. Component Organization Strategy

### Decision
Organize design system components in `src/components/ui/` with co-located tests and types.

### Rationale
- **Discoverability**: All UI components in one location
- **Maintainability**: Tests and types next to implementation
- **Existing pattern**: Matches current project structure
- **Simplicity**: No separate package needed for single-app project
- **Fast iteration**: No package versioning overhead

### Directory Structure
```
src/components/ui/
├── Button/
│   ├── Button.tsx          # Component implementation
│   ├── Button.test.tsx     # Unit tests
│   ├── Button.types.ts     # TypeScript types
│   └── index.ts            # Barrel export
├── Card/
├── Badge/
├── Input/
├── Modal/
└── [others]/
```

### Naming Conventions
- **PascalCase** for component files: `Button.tsx`
- **Props interface**: `{ComponentName}Props`
- **Variant types**: `{ComponentName}Variant`
- **Barrel exports**: Each component exports via `index.ts`

---

## 7. Pagination Implementation

### Decision
Server-side pagination with 50 items per page, URL parameter sync.

### Rationale
- **Predictability**: Users know where they are (page 3 of 10)
- **Bookmarkable**: URL parameters allow sharing specific pages
- **Accessibility**: Screen readers can announce page context
- **SEO-friendly**: Search engines can index paginated content
- **Performance**: Only fetch 50 items at a time

### Implementation Pattern
```typescript
// URL: /games?page=3
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Show: [Previous] [1] [2] [3] [4] [5] ... [10] [Next]
// Maximum 7 page numbers visible with ellipsis
```

### UX Guidelines
- Show "Page X of Y" text
- Highlight current page with primary color
- Disable Previous on page 1, Next on last page
- Keyboard navigation: Arrow keys to navigate
- "Go to page" input for direct access

---

## 8. Accessibility Implementation

### Decision
WCAG AA compliance with automated testing via Axe and manual keyboard/screen reader testing.

### Rationale
- **Legal requirement**: Many jurisdictions require AA compliance
- **Inclusive design**: 15% of world population has disabilities
- **Apple HIG mandate**: Accessibility is non-negotiable in HIG
- **SEO benefit**: Accessible sites rank better
- **Better UX**: Accessible design benefits all users

### Implementation Checklist
- **Color contrast**: 4.5:1 for text, 3:1 for UI components
- **Focus indicators**: Visible 2px ring on all interactive elements
- **ARIA labels**: All icons, images, interactive elements
- **Semantic HTML**: Proper heading hierarchy (h1 → h2 → h3)
- **Keyboard navigation**: Tab order, Enter/Space activation
- **Screen reader**: ARIA live regions for dynamic content
- **Form validation**: Associate errors with fields via `aria-describedby`

### Testing Tools
- **Axe DevTools**: Automated accessibility scanning
- **Lighthouse**: Accessibility audit in Chrome DevTools
- **VoiceOver**: Manual screen reader testing (macOS)
- **Keyboard only**: Tab through all pages without mouse

---

## 9. Testing Strategy for Design System

### Decision
TDD with unit tests for components, integration tests for interactions, E2E for user flows.

### Rationale
- **Constitution compliance**: TDD is mandatory (Principle IV)
- **Confidence**: Tests first ensure requirements are met
- **Regression prevention**: Catch visual/functional breaks early
- **Documentation**: Tests serve as usage examples

### Test Organization
```
tests/
├── unit/
│   └── components/
│       └── ui/
│           ├── Button.test.tsx       # Component behavior
│           ├── Card.test.tsx
│           └── useTheme.test.ts      # Hook logic
├── integration/
│   └── dark-mode.test.tsx            # Theme switching flow
└── e2e/
    └── responsive-layout.spec.ts     # Cross-viewport testing
```

### Test Coverage Goals
- **Unit tests**: >90% coverage for all UI components
- **Integration tests**: Dark mode toggle, pagination, form validation
- **E2E tests**: Complete user journeys on redesigned pages
- **Visual regression**: Snapshot tests for component variants

---

## 10. Performance Optimization

### Decision
Lazy load components, optimize images, use CSS containment, minimize bundle size.

### Rationale
- **Success criteria**: <3s load time on 3G, Lighthouse >80
- **User experience**: Fast interfaces feel more responsive
- **SEO**: Core Web Vitals affect search ranking
- **Accessibility**: Faster load helps users on limited data plans

### Optimization Techniques
1. **Code splitting**: Dynamic imports for heavy components
   ```typescript
   const Modal = dynamic(() => import('@/components/ui/Modal'));
   ```

2. **CSS containment**: Isolate component rendering
   ```css
   .card { contain: layout style paint; }
   ```

3. **Font optimization**: System fonts (zero download)

4. **Image optimization**: Next.js Image component with WebP

5. **Bundle analysis**: Monitor with `@next/bundle-analyzer`

### Performance Metrics
- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <3.0s
- **Cumulative Layout Shift**: <0.1
- **Largest Contentful Paint**: <2.5s

---

## Summary

All technical decisions have been made and documented. Key takeaways:

1. **Design Tokens**: CSS custom properties for runtime flexibility
2. **Dark Mode**: System preference + user override with localStorage
3. **Typography**: System font stack (San Francisco first)
4. **Animation**: Apple-standard easing curves with reduced motion support
5. **Responsive**: Three breakpoints (mobile/tablet/desktop)
6. **Organization**: Co-located components in `src/components/ui/`
7. **Pagination**: Server-side with 50 items, URL synced
8. **Accessibility**: WCAG AA with automated + manual testing
9. **Testing**: TDD with >90% coverage goal
10. **Performance**: <3s load, Lighthouse >80

**Status**: ✅ Research complete. Ready for Phase 1 (Design & Contracts).
