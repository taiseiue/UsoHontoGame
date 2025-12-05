# Design System Documentation
Feature: 009-apple-hig-ui-redesign

## Overview

This design system implements Apple Human Interface Guidelines (HIG) principles for a modern, accessible, and responsive web application. It provides a comprehensive set of UI components, utilities, and patterns.

## Architecture

### Phase 1-5: Foundation (Completed)
- Color system with semantic tokens
- Typography scale (iOS-inspired)
- Spacing system (4px base)
- Elevation/shadow utilities
- Dark mode support
- Base UI components (Button, Card, Badge)

### Phase 6: Design System Components (Completed)
- **Input**: Text input with variants, sizes, and validation states
- **Select**: Dropdown with option groups and disabled options
- **Spinner**: Loading indicator with size/color variants
- **Modal**: Dialog with focus trap and backdrop

### Phase 7: Accessibility (Completed)
- Focus trap utilities for modals
- Screen reader announcements
- Skip links for keyboard navigation
- VisuallyHidden component
- WCAG AA compliance

### Phase 8: Responsive Design (Completed)
- Breakpoint utilities (sm, md, lg, xl, 2xl)
- useMediaQuery hook
- useBreakpoint hook
- Container component

### Phase 9: Micro-interactions (Completed)
- Animation transitions (fade, slide, scale)
- Hover/focus effects
- Scroll-triggered animations
- Stagger animations
- Animation hooks

## Components

### Button
Apple HIG-compliant button with multiple variants and states.

```tsx
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="md">
  Click me
</Button>
```

**Variants**: primary, secondary, outline, ghost, danger
**Sizes**: sm, md, lg
**States**: default, hover, active, disabled, loading

### Card
Container component with elevation and interactive states.

```tsx
import { Card } from '@/components/ui/Card';

<Card elevated interactive>
  <h3>Card Title</h3>
  <p>Card content</p>
</Card>
```

**Props**: elevated, interactive, padding, className

### Input
Form input with validation and accessibility features.

```tsx
import { Input } from '@/components/ui/Input';

<Input
  label="Email"
  type="email"
  placeholder="your@email.com"
  error={hasError}
  errorMessage="Invalid email"
  required
/>
```

**Features**:
- Label and helper text
- Error states with validation messages
- Left/right icon slots
- Size variants (sm, md, lg)
- Style variants (default, filled, outlined)
- Full accessibility (ARIA attributes)

### Select
Dropdown component with option groups and disabled options.

```tsx
import { Select } from '@/components/ui/Select';

<Select
  options={[
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2', disabled: true },
    { value: '3', label: 'Option 3', group: 'Group A' }
  ]}
  label="Choose"
  placeholder="Select option"
/>
```

**Features**:
- Option grouping (optgroups)
- Disabled options
- Validation states
- Custom styling

### Spinner
Loading indicator for async operations.

```tsx
import { Spinner } from '@/components/ui/Spinner';

<Spinner size="md" variant="primary" label="Loading..." />
```

**Sizes**: sm, md, lg, xl
**Variants**: primary, secondary, light, dark
**Props**: label, centered, aria-label

### Modal
Dialog component with focus trap and proper accessibility.

```tsx
import { Modal } from '@/components/ui/Modal';

<Modal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  size="md"
  showCloseButton
  closeOnBackdropClick
  aria-label="Confirmation Dialog"
>
  <h2>Modal Title</h2>
  <p>Modal content</p>
</Modal>
```

**Features**:
- Focus trap
- ESC key handler
- Body scroll lock
- Portal rendering
- Size variants (sm, md, lg, xl, full)

### Badge
Status indicator with semantic colors.

```tsx
import { Badge } from '@/components/ui/Badge';

<Badge variant="success" size="md">
  Active
</Badge>
```

**Variants**: default, success, warning, error, info
**Sizes**: sm, md, lg

### Container
Responsive layout container.

```tsx
import { Container } from '@/components/ui/Container';

<Container size="xl" centered padding>
  <h1>Page content</h1>
</Container>
```

**Sizes**: sm, md, lg, xl, 2xl, full
**Props**: centered, padding

### SkipLink
Accessibility helper for keyboard navigation.

```tsx
import { SkipLink } from '@/components/ui/SkipLink';

<SkipLink targetId="main-content">
  Skip to main content
</SkipLink>
```

### VisuallyHidden
Hide content visually while keeping it accessible.

```tsx
import { VisuallyHidden } from '@/components/ui/VisuallyHidden';

<button>
  <Icon name="close" />
  <VisuallyHidden>Close dialog</VisuallyHidden>
</button>
```

## Utilities

### Elevation
Shadow and z-index utilities for depth.

```tsx
import { getElevationClassName } from '@/lib/design-system/elevation';

const className = getElevationClassName({
  level: 'elevated',
  zIndex: 'modal',
  interactive: true
});
```

**Levels**: flat, raised, floating, elevated, lifted
**Z-Index**: base, raised, dropdown, sticky, overlay, modal, popover, tooltip

### Transitions
Animation presets for smooth interactions.

```tsx
import { entrance, hover } from '@/lib/animations/transitions';

<div className={entrance.fadeInUp}>
  Animated content
</div>

<button className={hover.lift}>
  Hover me
</button>
```

**Entrance**: fadeIn, fadeInUp, fadeInDown, scaleIn
**Exit**: fadeOut, fadeOutUp, scaleOut
**Hover**: lift, grow, shrink, brightness
**Loading**: spin, pulse, bounce

### Focus Trap
Trap focus within a container (e.g., modals).

```tsx
import { createFocusTrap } from '@/lib/accessibility/focus-trap';

useEffect(() => {
  const cleanup = createFocusTrap(modalRef.current);
  return cleanup;
}, []);
```

### Screen Reader Announcements
Announce messages to screen readers.

```tsx
import { announce } from '@/lib/accessibility/announcer';

// Polite announcement
announce('Form submitted successfully');

// Assertive announcement
announce('Error occurred', 'assertive');
```

## Hooks

### useMediaQuery
React hook for responsive behavior.

```tsx
import { useMediaQuery } from '@/hooks/useMediaQuery';

const isMobile = useMediaQuery('(max-width: 768px)');
const isLargeScreen = useMediaQuery('lg');
```

### useBreakpoint
Get current breakpoint.

```tsx
import { useBreakpoint } from '@/hooks/useMediaQuery';

const breakpoint = useBreakpoint();
if (breakpoint === 'lg') {
  // Desktop layout
}
```

### useAnimation
Trigger animations on mount.

```tsx
import { useAnimation } from '@/hooks/useAnimation';

const isAnimating = useAnimation(true);
return <div className={isAnimating ? 'animate-in' : ''}>{...}</div>
```

### useScrollAnimation
Scroll-triggered animations.

```tsx
import { useScrollAnimation } from '@/hooks/useAnimation';

const ref = useRef<HTMLDivElement>(null);
const isVisible = useScrollAnimation(ref);
return <div ref={ref} className={isVisible ? 'animate-in' : 'opacity-0'}>{...}</div>
```

### useHoverAnimation
Hover state management.

```tsx
import { useHoverAnimation } from '@/hooks/useAnimation';

const { isHovered, hoverProps } = useHoverAnimation();
return <div {...hoverProps} className={isHovered ? 'scale-105' : ''}>{...}</div>
```

### useStaggerAnimation
Stagger animations for lists.

```tsx
import { useStaggerAnimation } from '@/hooks/useAnimation';

const itemStates = useStaggerAnimation(items.length, 100);
return items.map((item, i) => (
  <div key={i} className={itemStates[i] ? 'animate-in' : 'opacity-0'}>
    {item}
  </div>
))
```

## Design Tokens

### Colors
- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Amber (#F59E0B)
- Error: Red (#EF4444)
- Neutral: Gray scale

### Typography
- Font: System font stack (-apple-system, SF Pro)
- Scales: xs, sm, base, lg, xl, 2xl, 3xl, 4xl
- Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Spacing
- Base unit: 4px
- Scale: 0, 1 (4px), 2 (8px), 3 (12px), 4 (16px), ...

### Breakpoints
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

## Accessibility Features

- WCAG AA compliant
- Keyboard navigation support
- Screen reader optimized
- Focus management
- ARIA attributes
- Color contrast checked
- Skip links
- Focus indicators

## Dark Mode

All components support dark mode out of the box using Tailwind's `dark:` variant.

```tsx
// Automatically adapts to system preference
<Button variant="primary">Click me</Button>
```

## Best Practices

1. **Always use semantic HTML**: Use buttons for actions, links for navigation
2. **Provide labels**: Every form input should have a label
3. **Handle loading states**: Use Spinner component for async operations
4. **Keyboard accessibility**: Ensure all interactive elements are keyboard accessible
5. **Error handling**: Show clear error messages with validation
6. **Responsive design**: Use Container and breakpoint utilities
7. **Animations**: Keep animations subtle and purposeful
8. **Focus management**: Use focus trap for modals/dialogs

## Testing

All components are thoroughly tested with:
- Unit tests (Vitest + React Testing Library)
- Accessibility tests (ARIA attributes, keyboard navigation)
- Visual regression tests
- Integration tests

## Contributing

When adding new components:
1. Follow Apple HIG principles
2. Include TypeScript types
3. Add comprehensive tests
4. Document props and usage
5. Ensure accessibility
6. Support dark mode
7. Make it responsive

## Resources

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
