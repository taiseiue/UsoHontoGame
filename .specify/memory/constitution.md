<!--
SYNC IMPACT REPORT
==================
Version Change: Initial (template) → 1.0.0
Rationale: Initial constitution establishing core project principles

Modified Principles:
- All principles defined from template placeholders

Added Sections:
- Core Principles (7 principles defined)
- Technology Standards (frontend, backend, testing)
- Development Workflow
- Governance

Removed Sections: None

Templates Requiring Updates:
✅ spec-template.md - Aligned with functional requirements and user story format
✅ plan-template.md - Aligned with Clean Architecture and constitution check
✅ tasks-template.md - Aligned with TDD requirement and component structure

Follow-up TODOs: None
-->

# UsoHontoGame (Two Truths and a Lie) Project Constitution

## Core Principles

### I. Clean Architecture (NON-NEGOTIABLE)

The backend MUST follow Clean Architecture with strict layer separation:
- **Presentation Layer**: API Routes handle HTTP concerns only (request/response, validation, serialization)
- **Application Layer**: Use Cases contain business workflows and orchestration
- **Domain Layer**: Entities and interfaces define core business rules, independent of frameworks
- **Infrastructure Layer**: Repositories, database, external APIs implement domain interfaces

**Rationale**: Ensures business logic independence, testability, and maintainability. Domain layer must remain framework-agnostic to enable easy migration and testing.

### II. Component Architecture (NON-NEGOTIABLE)

Frontend MUST follow three-layer component hierarchy:
- **Pages Layer**: Page-level components composing domain and UI components, handling navigation and cross-domain coordination
- **Domain Layer**: Business-specific components encapsulating domain logic (budget, game, user domains)
- **UI Layer**: Reusable, generic components with no business logic (Button, Input, Modal)

**Rationale**: Ensures clear separation of concerns, reusability, and maintainability. Components know their responsibility boundaries.

### III. Custom Hooks Architecture (NON-NEGOTIABLE)

ALL component logic and state MUST be implemented in custom hooks. Components are PURELY presentational.
- Hooks MUST be co-located in a `hooks/` directory within the component directory
- Each hook MUST have a single, clear responsibility
- Complex components MAY have multiple specialized hooks
- All hooks MUST be independently testable

**Rationale**: Enforces separation of logic and rendering, improves testability, enables logic reuse across components.

### IV. Test-Driven Development (NON-NEGOTIABLE)

TDD is MANDATORY for all implementation work:
1. Write tests FIRST based on requirements
2. Ensure tests FAIL (Red)
3. Implement minimum code to pass tests (Green)
4. Refactor while keeping tests green (Refactor)

Tests MUST cover:
- Unit tests for hooks, use cases, domain entities
- Integration tests for API endpoints and user journeys
- Component tests for UI behavior

**Rationale**: Ensures requirements are met, prevents regressions, improves design quality through test-first thinking.

### V. Type Safety (NON-NEGOTIABLE)

TypeScript strict mode MUST be enabled. Type safety is REQUIRED end-to-end:
- All function parameters and return types MUST be explicitly typed
- No `any` types except when interfacing with untyped libraries (must be documented)
- Shared types MUST be defined in `types/` directory
- DTOs (Data Transfer Objects) MUST be defined for all API requests/responses

**Rationale**: Prevents runtime errors, improves IDE support, serves as living documentation.

### VI. Documentation Standards

All features MUST reference requirements from `docs/` directory:
- Requirements specification in `docs/requirement.md`
- Screen specifications in `docs/screen_spec/`
- Architecture decisions in `architecture.md`

Feature specifications MUST:
- Include prioritized user stories (P1, P2, P3)
- Define acceptance criteria in Given-When-Then format
- Reference relevant requirements and screen specs

**Rationale**: Ensures traceability from requirements to implementation, maintains single source of truth for project vision.

### VII. Server Components First

Leverage React Server Components by default:
- Use Server Components for data fetching and static content
- Use Client Components (`"use client"`) ONLY when needed:
  - User interactions (onClick, onChange, form handling)
  - Browser APIs (localStorage, window)
  - React hooks (useState, useEffect, custom hooks)

**Rationale**: Optimizes performance, reduces client bundle size, improves SEO and initial load time.

## Technology Standards

### Frontend Stack
- **Next.js 15**: App Router with React Server Components
- **React 19**: Latest features (Server Components, Actions)
- **TypeScript 5**: Full type safety with strict mode
- **Tailwind CSS v4**: Utility-first styling
- **Biome**: Code formatting and linting

### Backend Stack
- **Next.js API Routes**: RESTful API following Clean Architecture
- **TypeScript 5**: Shared language with frontend for type safety
- **Repository Pattern**: Data access abstraction
- **Use Case Pattern**: Business logic encapsulation

### Testing Stack
- **Vitest**: Unit and integration testing framework
- **React Testing Library**: Component testing
- **Test-Driven Development**: Red-Green-Refactor cycle

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes (Presentation Layer)
│   └── (pages)/           # Pages and layouts
├── components/            # UI Components
│   ├── pages/            # Page-level components
│   ├── domain/           # Domain-specific components
│   └── ui/               # Reusable UI components
├── server/               # Backend (Clean Architecture)
│   ├── domain/           # Domain Layer
│   ├── application/      # Application Layer (Use Cases)
│   └── infrastructure/   # Infrastructure Layer
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and configurations
└── types/                # TypeScript type definitions
docs/                     # Requirements and specifications
tests/                    # Test files
```

## Development Workflow

### Feature Development Process
1. **Specification**: Create feature spec with user stories in `specs/[feature]/spec.md`
2. **Planning**: Generate implementation plan in `specs/[feature]/plan.md`
3. **Task Generation**: Create prioritized task list in `specs/[feature]/tasks.md`
4. **TDD Implementation**:
   - Write tests first (failing)
   - Implement minimum code to pass
   - Refactor while maintaining green tests
5. **Review**: Verify constitution compliance before merge

### Code Review Requirements
All pull requests MUST:
- Pass all automated tests
- Follow Clean Architecture layer separation
- Use custom hooks for all component logic
- Include type definitions for all new code
- Reference related requirements and user stories
- Demonstrate TDD approach (tests written first)

### Constitution Compliance
Before implementing any feature:
- Verify alignment with core principles
- Check technology stack compliance
- Confirm component and architecture patterns
- Validate testing requirements

## Governance

This constitution supersedes all other development practices and guidelines. Any deviation from these principles MUST be:
1. Explicitly documented with justification
2. Reviewed and approved during code review
3. Marked as technical debt if temporary

### Amendment Process
Constitution changes require:
1. Documented rationale for the change
2. Impact assessment on existing code
3. Migration plan if applicable
4. Update to version following semantic versioning:
   - **MAJOR**: Breaking changes to core principles
   - **MINOR**: New principles or sections added
   - **PATCH**: Clarifications or typo fixes

### Version Control
Constitution changes MUST:
- Increment version according to semantic versioning rules
- Update LAST_AMENDED_DATE to current date
- Include sync impact report detailing changes

### Compliance Review
All development work MUST verify compliance with this constitution. Non-compliance discovered during review MUST be addressed before merge or documented as technical debt with remediation plan.

**Version**: 1.0.0 | **Ratified**: 2025-06-11 | **Last Amended**: 2025-06-11
