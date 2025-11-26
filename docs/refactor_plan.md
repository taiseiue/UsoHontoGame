# Refactoring Plan: Architecture Compliance

This document outlines the plan to refactor the codebase to comply with the `architecture.md`, specifically focusing on the **App Router Page Separation Pattern**.

## Objective
Ensure all App Router pages (`src/app/**/page.tsx`) act as thin wrappers that delegate logic and UI rendering to dedicated page components located in `src/components/pages/`.

## Identified Violations
The following pages currently contain implementation details (UI and logic) that should be moved to the component layer:

1.  `src/app/games/create/page.tsx`
2.  `src/app/games/[id]/presenters/page.tsx`
3.  `src/app/games/[id]/page.tsx`
4.  `src/app/games/[id]/dashboard/page.tsx`

## Refactoring Strategy

For each identified page, we will follow this process:

1.  **Create Component Directory**:
    Create `src/components/pages/[PageName]/` with the following structure:
    *   `index.tsx`: The main presentational component.
    *   `[PageName].types.ts`: Prop types and other type definitions.
    *   `hooks/use[PageName].ts`: Custom hook containing all business logic (state, handlers, effects).

2.  **Extract Logic & UI**:
    *   Move all `useState`, `useEffect`, and event handlers to the custom hook.
    *   Move JSX and UI logic to the `index.tsx` component.
    *   Ensure the component is purely presentational where possible.

3.  **Update App Router Page**:
    *   Replace the content of `src/app/**/page.tsx` with a thin wrapper.
    *   The wrapper should only handle:
        *   Route parameters (`params`, `searchParams`).
        *   Server-side data fetching (if applicable).
        *   Authentication checks/redirects.
        *   Delegating to the new Page Component.

## Tasks

### Phase 1: Game Creation
- [ ] **Refactor `src/app/games/create/page.tsx`**
    - [ ] Create `src/components/pages/GameCreatePage` structure.
    - [ ] Extract logic to `src/components/pages/GameCreatePage/hooks/useGameCreatePage.ts`.
    - [ ] Move UI to `src/components/pages/GameCreatePage/index.tsx`.
    - [ ] Simplify `src/app/games/create/page.tsx`.

### Phase 2: Presenter Management
- [ ] **Refactor `src/app/games/[id]/presenters/page.tsx`**
    - [ ] Create `src/components/pages/PresenterManagementPage` structure.
    - [ ] Extract logic to `src/components/pages/PresenterManagementPage/hooks/usePresenterManagementPage.ts`.
    - [ ] Move UI to `src/components/pages/PresenterManagementPage/index.tsx`.
    - [ ] Simplify `src/app/games/[id]/presenters/page.tsx`.

### Phase 3: Game Detail
- [ ] **Refactor `src/app/games/[id]/page.tsx`**
    - [ ] Create `src/components/pages/GameDetailPage` structure.
    - [ ] Move logic and UI to `src/components/pages/GameDetailPage`.
    - [ ] Simplify `src/app/games/[id]/page.tsx` to handle data fetching and pass props.

### Phase 4: Game Dashboard
- [ ] **Refactor `src/app/games/[id]/dashboard/page.tsx`**
    - [ ] Create `src/components/pages/GameDashboardPage` structure.
    - [ ] Extract logic to `src/components/pages/GameDashboardPage/hooks/useGameDashboardPage.ts`.
    - [ ] Move UI to `src/components/pages/GameDashboardPage/index.tsx`.
    - [ ] Simplify `src/app/games/[id]/dashboard/page.tsx`.

## Verification
- [ ] Ensure all new components have corresponding types.
- [ ] Run `npx biome format --write .` to ensure formatting compliance.
- [ ] Verify that the application builds and runs correctly after each refactor.