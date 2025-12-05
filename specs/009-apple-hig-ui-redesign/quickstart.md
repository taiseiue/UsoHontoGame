# Quickstart Guide: Apple HIG Design System

**Feature**: 009-apple-hig-ui-redesign
**Date**: 2025-12-02
**Audience**: Developers implementing the redesign

## Overview

This guide helps you quickly get started with the Apple HIG-based design system. Follow these steps to implement components, use design tokens, and maintain consistency across the application.

---

## Prerequisites

- TypeScript 5 with strict mode
- Next.js 16.0.1 (App Router)
- React 19.2.0
- Tailwind CSS v4
- Biome 2.3.4

---

## Quick Start (30 seconds)

### 1. Import Design Tokens

```typescript
// In your component
import '@/styles/tokens/colors.css';
import '@/styles/tokens/spacing.css';
import '@/styles/tokens/typography.css';
```

Design tokens are automatically available via CSS custom properties:

```css
.my-element {
  color: var(--text-primary);
  background: var(--bg-primary);
  padding: var(--spacing-md);
}
```

### 2. Use a Design System Component

```typescript
import { Button } from '@/components/ui/Button';

function MyPage() {
  return (
    <Button variant="primary" size="large" onClick={() => alert('Clicked!')}>
      Click Me
    </Button>
  );
}
```

### 3. Enable Dark Mode

```typescript
import { ThemeProvider } from '@/providers/ThemeProvider';

// In your root layout
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

## Design Token Usage

### Color Tokens

```css
/* Light mode */
:root {
  --color-primary: #007AFF;
  --color-success: #34C759;
  --color-error: #FF3B30;
  --bg-primary: #FFFFFF;
  --text-primary: #000000;
}

/* Dark mode */
[data-theme="dark"] {
  --bg-primary: #1C1C1E;
  --text-primary: #FFFFFF;
}
```

**Usage**:
```tsx
<div className="bg-[var(--bg-primary)] text-[var(--text-primary)]">
  Hello World
</div>
```

### Spacing Tokens

```css
:root {
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
}
```

**Usage**:
```tsx
<div className="p-[var(--spacing-md)] gap-[var(--spacing-sm)]">
  Content
</div>
```

### Typography Tokens

```css
:root {
  --font-family-base: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto;
  --font-size-display: 28px;
  --font-size-title: 22px;
  --font-size-body: 16px;
  --font-weight-bold: 700;
}
```

**Usage**:
```tsx
<h1 className="font-[var(--font-family-base)] text-[var(--font-size-display)] font-[var(--font-weight-bold)]">
  Heading
</h1>
```

---

## Component Library

### Button

```typescript
import { Button } from '@/components/ui/Button';

// Variants: primary, secondary, danger, ghost
// Sizes: small, medium, large

<Button variant="primary" size="large">Primary Button</Button>
<Button variant="secondary" size="medium">Secondary Button</Button>
<Button variant="danger" loading>Delete</Button>
<Button variant="ghost" disabled>Disabled</Button>
```

### Card

```typescript
import { Card } from '@/components/ui/Card';

// Variants: default, elevated, outlined
// Padding: none, small, medium, large

<Card variant="elevated" padding="medium">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>
```

### Badge

```typescript
import { Badge } from '@/components/ui/Badge';

// Variants: primary, success, warning, danger, neutral
// Sizes: small, medium, large

<Badge variant="success" size="medium">準備中</Badge>
<Badge variant="danger">締切</Badge>
```

### Input

```typescript
import { Input } from '@/components/ui/Input';

<Input
  label="Username"
  value={username}
  onChange={setUsername}
  placeholder="Enter username"
  required
/>

<Input
  type="email"
  value={email}
  onChange={setEmail}
  error={!!emailError}
  errorMessage={emailError}
/>
```

### Modal

```typescript
import { Modal } from '@/components/ui/Modal';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  size="medium"
>
  <p>Are you sure you want to proceed?</p>
  <div className="flex gap-2 mt-4">
    <Button variant="primary">Confirm</Button>
    <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
  </div>
</Modal>
```

### Toast

```typescript
import { useToast } from '@/hooks/useToast';

function MyComponent() {
  const { showSuccess, showError } = useToast();

  const handleSubmit = async () => {
    try {
      await submitForm();
      showSuccess('Form submitted successfully!');
    } catch (error) {
      showError('Failed to submit form');
    }
  };
}
```

### Pagination

```typescript
import { Pagination } from '@/components/ui/Pagination';

<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={(page) => setCurrentPage(page)}
  totalItems={totalItems}
/>
```

### Skeleton (Loading States)

```typescript
import { Skeleton } from '@/components/ui/Skeleton';

// While loading
{isLoading ? (
  <>
    <Skeleton variant="text" width="100%" />
    <Skeleton variant="rectangular" width="100%" height={200} />
  </>
) : (
  <Content />
)}
```

---

## Dark Mode Usage

### In Components

```typescript
import { useTheme } from '@/lib/design-system/useTheme';

function MyComponent() {
  const { theme, effectiveTheme, setTheme, toggleTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {effectiveTheme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <button onClick={() => setTheme('system')}>Use System</button>
    </div>
  );
}
```

### In Stylesheets

```css
/* Automatically adapts based on data-theme attribute */
.my-element {
  background: var(--bg-primary); /* White in light, dark gray in dark */
  color: var(--text-primary);    /* Black in light, white in dark */
}

/* Manual dark mode overrides (if needed) */
[data-theme="dark"] .my-element {
  border-color: #3A3A3C;
}
```

---

## Responsive Design

### Using Breakpoints

```typescript
import { BREAKPOINTS } from '@/contracts/design-system-types';

// In component logic
const isMobile = window.innerWidth < BREAKPOINTS.tablet.minWidth;
const isDesktop = window.innerWidth >= BREAKPOINTS.desktop.minWidth;
```

### In Stylesheets

```css
/* Mobile-first approach */
.container {
  padding: var(--spacing-md);
  grid-template-columns: 1fr;
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .container {
    padding: var(--spacing-lg);
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .container {
    padding: var(--spacing-xl);
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Tailwind Responsive Classes

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* 1 column on mobile, 2 on tablet, 3 on desktop */}
</div>
```

---

## Accessibility

### Focus Indicators

All interactive elements automatically have focus indicators:

```css
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### ARIA Labels

```tsx
<button aria-label="Close modal" onClick={onClose}>
  <XIcon />
</button>

<img src={src} alt="Game thumbnail" />
```

### Keyboard Navigation

```tsx
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Custom Button
</div>
```

### Screen Reader Support

```tsx
<div aria-live="polite" role="status">
  {successMessage}
</div>

<nav aria-label="Pagination">
  <Pagination {...props} />
</nav>
```

---

## Animation

### Using Animation Tokens

```css
.fade-in {
  animation: fadeIn var(--duration-medium) var(--ease-out);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### Respecting Reduced Motion

```typescript
import { useAccessibility } from '@/hooks/useAccessibility';

function AnimatedComponent() {
  const { profile } = useAccessibility();

  return (
    <div className={profile.reducedMotion ? 'no-animation' : 'animated'}>
      Content
    </div>
  );
}
```

```css
/* CSS approach */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Testing

### Component Testing

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders with correct variant', () => {
    render(<Button variant="primary">Click Me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass('bg-blue-600');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

### Dark Mode Testing

```typescript
it('applies dark mode styles', () => {
  document.documentElement.setAttribute('data-theme', 'dark');
  render(<Card>Content</Card>);

  const card = screen.getByText('Content').parentElement;
  const bgColor = getComputedStyle(card!).backgroundColor;
  expect(bgColor).toBe('rgb(28, 28, 30)'); // --bg-primary in dark mode
});
```

---

## Common Patterns

### Page Layout

```typescript
import { Header } from '@/components/ui/Header';
import { AccessibilityProvider } from '@/components/ui/AccessibilityProvider';

export default function MyPage() {
  return (
    <AccessibilityProvider>
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <Header />
        <main className="container mx-auto max-w-7xl px-[var(--spacing-lg)] py-[var(--spacing-xl)]">
          {/* Page content */}
        </main>
      </div>
    </AccessibilityProvider>
  );
}
```

### Form with Validation

```typescript
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

function MyForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        error={!!errors.email}
        errorMessage={errors.email}
        required
      />

      <Button type="submit" variant="primary" loading={isSubmitting}>
        Submit
      </Button>
    </form>
  );
}
```

### List with Pagination

```typescript
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';

function GameList({ games, totalPages, currentPage, onPageChange }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-md)]">
        {games.map(game => (
          <Card key={game.id} variant="elevated">
            {/* Game content */}
          </Card>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        totalItems={games.length}
      />
    </>
  );
}
```

---

## Best Practices

### 1. Use Design Tokens

✅ **DO**: Use CSS custom properties
```css
.element { color: var(--text-primary); }
```

❌ **DON'T**: Hardcode values
```css
.element { color: #000000; }
```

### 2. Prefer Design System Components

✅ **DO**: Use design system components
```tsx
<Button variant="primary">Submit</Button>
```

❌ **DON'T**: Create custom buttons
```tsx
<button className="bg-blue-600 text-white px-4 py-2">Submit</button>
```

### 3. Follow Accessibility Guidelines

✅ **DO**: Include ARIA labels
```tsx
<button aria-label="Close dialog" onClick={onClose}>×</button>
```

❌ **DON'T**: Omit labels for non-text elements
```tsx
<button onClick={onClose}>×</button>
```

### 4. Respect User Preferences

✅ **DO**: Check for reduced motion
```typescript
const { reducedMotion } = useAccessibility();
if (!reducedMotion) animateElement();
```

❌ **DON'T**: Force animations
```typescript
animateElement(); // Always animates
```

### 5. Test Dark Mode

✅ **DO**: Test both themes
```typescript
it('works in dark mode', () => {
  document.documentElement.setAttribute('data-theme', 'dark');
  render(<Component />);
  // assertions
});
```

---

## Troubleshooting

### Design tokens not working

**Problem**: CSS variables showing as undefined

**Solution**: Ensure token files are imported in root layout:
```typescript
// app/layout.tsx
import '@/styles/tokens/colors.css';
import '@/styles/tokens/spacing.css';
// ...
```

### Dark mode not switching

**Problem**: Theme toggle doesn't apply changes

**Solution**: Verify `ThemeProvider` wraps your app:
```typescript
<ThemeProvider>
  {children}
</ThemeProvider>
```

### Components not styled

**Problem**: Components appear unstyled

**Solution**: Check that you're importing from correct path:
```typescript
import { Button } from '@/components/ui/Button'; // ✅ Correct
import { Button } from '@/components/Button';    // ❌ Wrong
```

---

## Next Steps

1. **Review the specification**: Read [spec.md](./spec.md) for complete requirements
2. **Check data models**: See [data-model.md](./data-model.md) for entity definitions
3. **Explore contracts**: Review [contracts/design-system-types.ts](./contracts/design-system-types.ts)
4. **Start implementing**: Follow TDD approach (tests first!)
5. **Run tests**: `npm test` to verify implementation
6. **Format code**: `npx biome format --write .` before committing

---

## Resources

- **Apple HIG**: https://developer.apple.com/design/human-interface-guidelines/
- **WCAG AA Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **CSS Custom Properties**: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties
- **Tailwind CSS v4**: https://tailwindcss.com/docs

---

**Status**: ✅ Quickstart complete. Ready for task generation (`/speckit.tasks`).
