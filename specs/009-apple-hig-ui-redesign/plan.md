# Implementation Plan: Apple HIG-Based UI Redesign

**Branch**: `009-apple-hig-ui-redesign` | **Date**: 2025-12-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-apple-hig-ui-redesign/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Redesign all application screens (10+ pages) based on Apple's Human Interface Guidelines to improve visual clarity, accessibility, and consistency. Implement comprehensive design system with design tokens (CSS custom properties), reusable UI components, dark mode support, and responsive layouts. Deploy all screens simultaneously in a big bang migration strategy.

**Primary Requirements:**
- Visual clarity with clear hierarchy and consistent spacing (8px grid system)
- Content-first deference minimizing distractions
- Depth through layering and elevation (shadows, overlays)
- Accessible design meeting WCAG AA standards
- Responsive layouts (mobile 375px, tablet 768px, desktop 1440px)
- Dark mode with system preference + user override toggle
- Pagination for lists (50 items per page)

**Technical Approach:**
- CSS custom properties for design tokens in `src/styles/tokens/`
- Reusable components in `src/components/ui/`
- Design system utilities in `src/lib/design-system/`
- San Francisco font with system fallbacks
- Apple-standard easing curves and animation timing
- Big bang deployment (all screens at once)

## Technical Context

**Language/Version**: TypeScript 5 (strict mode) / Node.js 20
**Primary Dependencies**: Next.js 16.0.1 (App Router), React 19.2.0, Tailwind CSS v4, Biome 2.3.4
**Storage**: N/A (UI redesign, existing database unchanged)
**Testing**: Vitest 4.0.7 (unit/integration), Playwright 1.56.1 (E2E), React Testing Library
**Target Platform**: Web (responsive: mobile, tablet, desktop)
**Project Type**: Web application (frontend redesign with existing backend)
**Performance Goals**:
- Page load <3 seconds on 3G network
- Lighthouse performance score >80
- Smooth animations at 60fps
- First Contentful Paint <1.5s
**Constraints**:
- Zero breaking changes to existing functionality
- All 2079 existing tests must continue passing
- Maintain i18n support (Japanese/English)
- No changes to backend/API layer
**Scale/Scope**:
- 10+ screens to redesign
- 20+ reusable UI components
- 5 design token categories
- Support 3 viewport breakpoints
- Test coverage >90%

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I. Clean Architecture ✅ **COMPLIANT**
- **Impact**: UI redesign does not affect backend architecture
- **Verification**: Use Cases, Repositories, Domain Layer remain unchanged
- **Status**: No violations

### Principle II. Component Architecture ✅ **COMPLIANT**
- **Impact**: Follows three-layer hierarchy (Pages, Domain, UI)
- **Verification**: UI components go in `src/components/ui/`, pages remain in `src/components/pages/`
- **Status**: No violations. Design system components will be pure UI layer components.

### Principle III. Custom Hooks Architecture ✅ **COMPLIANT**
- **Impact**: New components follow hooks-first pattern
- **Verification**: Logic in hooks/, components are presentational
- **Status**: No violations. New UI components will use hooks for dark mode, theme switching, etc.

### Principle IV. Test-Driven Development ✅ **COMPLIANT**
- **Impact**: TDD required for all new components
- **Verification**: Write tests first for design system components
- **Status**: No violations. Will follow Red-Green-Refactor for all UI components.

### Principle V. Type Safety ✅ **COMPLIANT**
- **Impact**: All design token types and component props must be strictly typed
- **Verification**: TypeScript strict mode enabled, explicit types for all props
- **Status**: No violations

### Principle VI. Documentation Standards ✅ **COMPLIANT**
- **Impact**: Feature spec references requirements, includes user stories with priorities
- **Verification**: spec.md includes 7 prioritized user stories, 10 success criteria
- **Status**: No violations

### Principle VII. Server Components First ✅ **COMPLIANT**
- **Impact**: Design system components may need Client Components for interactivity
- **Verification**: Use `"use client"` only where needed (theme toggle, animations)
- **Status**: No violations. Static design tokens and CSS remain server-friendly.

### Principle 0. Git Commit and Code Formatting ✅ **COMPLIANT**
- **Impact**: All modified files will be formatted with Biome before commit
- **Verification**: Run `npx biome format --write .` after each task
- **Status**: No violations

**Overall Gate Status**: ✅ **PASS** - All principles compliant, no violations to justify

## Project Structure

### Documentation (this feature)

```text
specs/009-apple-hig-ui-redesign/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Web application structure (existing + additions)
src/
├── app/                          # Next.js App Router (unchanged)
│   ├── api/                      # API Routes (unchanged)
│   └── (pages)/                  # Pages and layouts (to be restyled)
├── components/
│   ├── pages/                    # Page-level components (to be restyled)
│   ├── domain/                   # Domain-specific components (to be restyled)
│   └── ui/                       # Reusable UI components (NEW DESIGN SYSTEM COMPONENTS)
│       ├── Button/
│       │   ├── Button.tsx
│       │   ├── Button.test.tsx
│       │   └── Button.types.ts
│       ├── Card/
│       ├── Badge/
│       ├── Input/
│       ├── Modal/
│       ├── Toast/
│       ├── Pagination/
│       ├── Skeleton/
│       └── [20+ more components]
├── styles/                       # NEW: Design tokens
│   └── tokens/
│       ├── colors.css            # Light + dark mode colors
│       ├── spacing.css           # 8px grid system
│       ├── typography.css        # Font families, sizes, weights
│       ├── shadows.css           # Elevation levels
│       └── borders.css           # Border radius, widths
├── lib/
│   ├── design-system/            # NEW: Design system utilities
│   │   ├── classNames.ts         # Utility for combining classes
│   │   ├── useTheme.ts           # Dark mode hook
│   │   └── tokens.ts             # TypeScript token exports
│   └── i18n/                     # Existing i18n (unchanged)
├── hooks/                        # Custom React hooks (existing + new theme hooks)
├── providers/                    # React contexts (add ThemeProvider)
└── types/                        # TypeScript type definitions

tests/
├── unit/                         # Unit tests for components/hooks
├── integration/                  # Integration tests (unchanged)
└── e2e/                          # E2E tests for redesigned flows
```

**Structure Decision**: Web application with frontend redesign. New directories added for design system (`src/styles/tokens/`, `src/lib/design-system/`) while preserving existing architecture. All new UI components follow established patterns in `src/components/ui/` with co-located tests.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. This section is not applicable.

---

## Phase 0: Research (COMPLETE ✅)

All technical unknowns have been resolved and documented in [research.md](./research.md):

1. **CSS Custom Properties**: Chosen for design tokens (runtime flexibility for dark mode)
2. **Dark Mode Strategy**: System preference + user override with localStorage persistence
3. **San Francisco Font**: System font stack with -apple-system priority
4. **Animation & Easing**: Apple-standard cubic-bezier curves with reduced motion support
5. **Responsive Breakpoints**: 3 breakpoints (mobile/tablet/desktop)
6. **Component Organization**: Co-located in `src/components/ui/` with tests and types
7. **Pagination**: Server-side with 50 items per page, URL synced
8. **Accessibility**: WCAG AA compliance with automated + manual testing
9. **Testing Strategy**: TDD with >90% coverage goal
10. **Performance**: <3s load time, Lighthouse >80

**Status**: ✅ All research complete, no blockers

---

## Phase 1: Design & Contracts (COMPLETE ✅)

### Data Model ([data-model.md](./data-model.md))

Defined 7 frontend entities for design system state management:

1. **Design Token**: CSS custom property definitions
2. **Theme Preference**: User's dark mode choice (localStorage)
3. **Component Variant**: Styling variations for components
4. **Breakpoint Configuration**: Responsive breakpoint thresholds
5. **Animation Preset**: Reusable animation definitions
6. **Pagination State**: Pagination configuration and current page
7. **Accessibility Profile**: User accessibility preferences

**Key Insight**: No backend data model changes—this is a pure UI redesign feature.

### API Contracts ([contracts/design-system-types.ts](./contracts/design-system-types.ts))

TypeScript interfaces and types for all design system components:

- **Core Types**: `DesignToken`, `ThemePreference`, `ComponentVariant`
- **Component Props**: `ButtonProps`, `CardProps`, `BadgeProps`, `InputProps`, `ModalProps`, `ToastProps`, `PaginationProps`, `SkeletonProps`
- **System Constants**: `BREAKPOINTS`, `ANIMATION_DURATIONS`, `EASING_CURVES`
- **Accessibility**: `AccessibilityProfile`, `FontSizePreference`

All types exported for consumption by components and tests.

### Quickstart Guide ([quickstart.md](./quickstart.md))

Developer guide with:

- Quick start (30 seconds to first component)
- Design token usage examples
- Component library reference
- Dark mode implementation
- Responsive design patterns
- Accessibility guidelines
- Testing examples
- Best practices and troubleshooting

### Agent Context Update

Updated `CLAUDE.md` with:

- Language: TypeScript 5 (strict mode) / Node.js 20
- Frameworks: Next.js 16.0.1, React 19.2.0, Tailwind CSS v4, Biome 2.3.4
- Project type: Web application (frontend redesign)

**Status**: ✅ Design complete, contracts generated, ready for task generation

---

## Re-evaluated Constitution Check (COMPLETE ✅)

Post-design verification confirms all principles remain compliant:

### Principle I. Clean Architecture ✅
- No backend changes: Use Cases, Repositories, Domain Layer unchanged
- UI components remain in presentation layer

### Principle II. Component Architecture ✅
- Design system components are pure UI layer
- Follows three-tier hierarchy (Pages → Domain → UI)

### Principle III. Custom Hooks Architecture ✅
- New components use hooks for logic: `useTheme`, `useAccessibility`, `useToast`
- Components are presentational only

### Principle IV. Test-Driven Development ✅
- TDD confirmed as implementation approach in research
- Testing strategy: Unit (>90%), Integration, E2E
- Tests before implementation

### Principle V. Type Safety ✅
- All contracts defined with strict TypeScript types
- No `any` types in design system
- Exported types for component props and state

### Principle VI. Documentation Standards ✅
- Feature spec includes 7 prioritized user stories
- 10 measurable success criteria defined
- Research, data model, contracts, quickstart all documented

### Principle VII. Server Components First ✅
- Static design tokens and CSS are server-friendly
- Client Components only where needed (theme toggle, animations)

### Principle 0. Git Commit and Code Formatting ✅
- Biome formatting specified in workflow
- Commit after each task completion

**Final Gate Status**: ✅ **PASS** - All principles remain compliant after design

---

## Implementation Readiness

### Artifacts Generated

- ✅ **plan.md** - This implementation plan
- ✅ **research.md** - Technical decisions and research findings
- ✅ **data-model.md** - Entity definitions for design system
- ✅ **contracts/design-system-types.ts** - TypeScript type contracts
- ✅ **quickstart.md** - Developer quickstart guide
- ✅ **CLAUDE.md** - Updated agent context

### Next Steps

1. Run `/speckit.tasks` to generate dependency-ordered task list
2. Follow TDD approach: Write tests → Implement → Format → Commit
3. Implement design tokens first (foundational)
4. Build core UI components (Button, Card, Input, etc.)
5. Implement theme system and dark mode
6. Restyle existing pages using new components
7. Run full test suite (2079 tests must pass + new tests)
8. Validate accessibility (Axe, Lighthouse, manual testing)
9. Performance audit (Lighthouse >80, load time <3s)
10. Deploy all screens simultaneously (big bang strategy)

### Success Validation

Before merging, verify:

- [ ] All 10 success criteria met (SC-001 through SC-010)
- [ ] All existing tests passing (2079 tests)
- [ ] New tests >90% coverage for design system
- [ ] Accessibility audit: zero critical violations
- [ ] Performance: Lighthouse >80, load <3s
- [ ] Dark mode works in all browsers
- [ ] Responsive layouts on mobile/tablet/desktop
- [ ] Biome formatting applied to all files
- [ ] Constitution principles all compliant

---

## Planning Summary

**Feature**: Apple HIG-Based UI Redesign (009-apple-hig-ui-redesign)
**Branch**: `009-apple-hig-ui-redesign`
**Scope**: 10+ screens, 20+ components, comprehensive design system
**Strategy**: Big bang deployment (all screens at once)
**Timeline**: Implementation via `/speckit.tasks` (task generation pending)

**Status**: ✅ Planning complete. Ready for task generation.

**Command to continue**: `/speckit.tasks`
