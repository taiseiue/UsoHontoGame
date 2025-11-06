# Frontend Architecture

This document outlines the design patterns and architectural decisions for the CPM Prototype frontend built with Next.js 15 and React 19.

## Architecture Overview

### Framework Stack
- **Next.js 15**: App Router with React Server Components
- **React 19**: Latest features including Server Components and Actions
- **TypeScript 5**: Full type safety across the application
- **Tailwind CSS v4**: Utility-first styling

## Directory Structure

```
src/
├── app/                    # App Router (Next.js 15)
│   ├── (auth)/            # Route groups for authentication
│   ├── dashboard/         # Dashboard pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
│   ├── pages/            # Page-level components
│   │   ├── TopPage/      # Top/landing page components
│   │   ├── DashboardPage/ # Dashboard page components
│   │   └── SettingsPage/ # Settings page components
│   ├── ui/               # Base UI components (Button, Input, Modal)
│   ├── forms/            # Form-specific components
│   ├── layout/           # Layout components (Header, Sidebar, Footer)
│   └── domain/           # Domain-specific components
│       ├── budget/       # Budget domain components
│       ├── tenant/       # Tenant management components
│       ├── user/         # User domain components
│       └── auth/         # Authentication components
├── lib/                  # Utility functions and configurations
│   ├── utils.ts          # Common utilities
│   ├── api.ts            # API client configuration
│   └── auth.ts           # Authentication utilities
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
└── constants/            # Application constants
```

## Component Architecture

### Pages Layer Components
The pages layer contains page-level components that compose domain and UI components to create complete page experiences. These components handle page-specific concerns and coordinate between multiple domains.

#### Structure
```
components/pages/
├── TopPage/
│   ├── index.tsx          # Landing page component
│   ├── TopPage.types.ts   # Type definitions
│   ├── TopPage.stories.tsx # Storybook stories
│   └── hooks/
│       └── useTopPage.ts  # Page-specific logic
├── DashboardPage/
│   ├── index.tsx
│   ├── DashboardPage.types.ts
│   └── hooks/
│       └── useDashboardPage.ts
└── SettingsPage/
    ├── index.tsx
    ├── SettingsPage.types.ts
    └── hooks/
        └── useSettingsPage.ts
```

#### Pages Component Principles

1. **Page Composition**: Pages components compose domain and UI components to create complete page experiences
2. **Navigation Logic**: Handle page-specific navigation, routing, and URL state management
3. **Cross-Domain Coordination**: Coordinate interactions between multiple business domains
4. **Layout Management**: Manage page-specific layouts and responsive behavior
5. **SEO and Metadata**: Handle page-specific SEO, meta tags, and structured data

```tsx
// components/pages/TopPage/index.tsx
"use client";
import { useTopPage } from './hooks';
import type { TopPageProps } from './TopPage.types';

export function TopPage(props: TopPageProps) {
  const { handleLogin } = useTopPage();

  return (
    <div className="top-page">
      <h1>CPM Prototype</h1>
      <Button onClick={handleLogin} variant="primary">
        Login
      </Button>
    </div>
  );
}
```

#### Pages vs Domain vs UI Component Hierarchy

| Layer | Purpose | Examples |
|-------|---------|----------|
| **Pages** | Complete page experiences, navigation | `TopPage`, `DashboardPage` |
| **Domain** | Business logic, domain-specific behavior | `BudgetForm`, `UserProfile` |
| **UI** | Reusable components, design system | `Button`, `Input`, `Modal` |

### Domain Layer Components
The domain layer contains components that are specific to business domains, encapsulating domain logic and business rules within the UI layer.

#### Structure
```
components/domain/
├── budget/
│   ├── BudgetForm/
│   │   ├── index.tsx
│   │   ├── BudgetForm.types.ts
│   │   └── BudgetForm.test.tsx
│   ├── BudgetList/
│   ├── BudgetChart/
│   └── index.ts          # Export barrel
├── tenant/
│   ├── TenantSelector/
│   ├── TenantSettings/
│   └── TenantMemberList/
├── user/
│   ├── UserProfile/
│   ├── UserPermissions/
│   └── UserInvite/
└── auth/
    ├── LoginForm/
    ├── OAuthCallback/
    └── AuthGuard/
```

#### Domain Component Principles

1. **Business Logic Encapsulation**: Domain components contain business-specific validation, formatting, and behavior
2. **Self-Contained**: Each domain component manages its own state and side effects
3. **Reusable**: Can be used across different pages while maintaining domain consistency
4. **Testable**: Business logic is isolated and easily testable

```tsx
// components/domain/budget/BudgetForm/index.tsx
"use client";
import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { validateBudgetData, formatCurrency } from '@/lib/budget';
import type { BudgetFormData } from './BudgetForm.types';

export function BudgetForm({ onSubmit, initialData }: BudgetFormProps) {
  const [data, setData] = useState<BudgetFormData>(initialData);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Domain-specific validation
    const validationErrors = validateBudgetData(data);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="budget-form">
      <Input
        label="Budget Amount"
        value={formatCurrency(data.amount)}
        onChange={(value) => setData({ ...data, amount: value })}
        error={errors.amount}
      />
      {/* Other domain-specific fields */}
      <Button type="submit">Save Budget</Button>
    </form>
  );
}
```

#### Domain vs UI Component Distinction

| UI Components | Domain Components |
|---------------|-------------------|
| Generic, reusable across domains | Specific to business domain |
| No business logic | Contains domain logic |
| Style-focused | Behavior-focused |
| `components/ui/Button` | `components/domain/budget/BudgetForm` |

#### Domain Component Examples

**Budget Domain Components:**
```tsx
// components/domain/budget/BudgetList/index.tsx
export function BudgetList({ tenantId }: { tenantId: string }) {
  // Budget-specific data fetching and state management
  // Budget-specific filtering and sorting logic
  // Budget-specific formatting and calculations
}

// components/domain/budget/BudgetChart/index.tsx
export function BudgetChart({ data, period }: BudgetChartProps) {
  // Budget visualization logic
  // Period-based data transformation
  // Budget-specific chart configurations
}
```

**User Domain Components:**
```tsx
// components/domain/user/UserProfile/index.tsx
export function UserProfile({ userId }: { userId: string }) {
  // User-specific profile management
  // Permission-based field visibility
  // User data validation and updates
}

// components/domain/user/UserPermissions/index.tsx
export function UserPermissions({ user, tenant }: UserPermissionsProps) {
  // Role-based permission management
  // Tenant-specific permission rules
  // Permission validation logic
}
```

**Authentication Domain Components:**
```tsx
// components/domain/auth/AuthGuard/index.tsx
export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  // Authentication state management
  // Role-based access control
  // Redirect logic for unauthorized users
}
```

#### Domain Component Composition

Domain components can compose other domain components and UI components:

```tsx
// components/domain/budget/BudgetDashboard/index.tsx
import { BudgetList } from '../BudgetList';
import { BudgetChart } from '../BudgetChart';
import { BudgetSummary } from '../BudgetSummary';

export function BudgetDashboard({ tenantId }: { tenantId: string }) {
  return (
    <div className="budget-dashboard">
      <BudgetSummary tenantId={tenantId} />
      <div className="grid grid-cols-2 gap-6">
        <BudgetChart tenantId={tenantId} />
        <BudgetList tenantId={tenantId} />
      </div>
    </div>
  );
}
```

## Design Patterns

### 1. Server Components First
Leverage React Server Components for:
- Data fetching at the server level
- Reduced client bundle size
- Improved performance and SEO

```tsx
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const data = await fetchDashboardData();
  return <DashboardView data={data} />;
}
```

### 2. Client Components for Interactivity
Use `"use client"` directive only when needed:
- User interactions (onClick, onChange)
- Browser APIs (localStorage, geolocation)
- React hooks (useState, useEffect)

```tsx
"use client";
import { useState } from 'react';

export function InteractiveForm() {
  const [data, setData] = useState('');
  // Client-side logic here
}
```

### 3. Route Groups and Layouts
Organize routes with route groups and nested layouts:

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── layout.tsx        # Auth-specific layout
├── (dashboard)/
│   ├── analytics/page.tsx
│   ├── budget/page.tsx
│   └── layout.tsx        # Dashboard layout
└── layout.tsx            # Root layout
```

### 4. Component Composition
Follow composition over inheritance:

```tsx
// Good: Composition pattern
function Card({ children, title }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

function DashboardCard({ data }) {
  return (
    <Card title="Dashboard">
      <DashboardContent data={data} />
    </Card>
  );
}
```

### 5. Custom Hooks Architecture
**RULE: All logic and state MUST be implemented in custom hooks. Components should be purely presentational.**

#### Hook Organization Structure
Custom hooks should be located in a `hooks` directory within each component directory:

```
components/
├── ui/
│   ├── Button/
│   │   ├── index.tsx
│   │   ├── Button.types.ts
│   │   └── hooks/
│   │       └── useButtonState.ts
│   └── Modal/
│       ├── index.tsx
│       ├── Modal.types.ts
│       └── hooks/
│           ├── useModal.ts
│           └── useModalAnimation.ts
└── domain/
    ├── budget/
    │   ├── BudgetForm/
    │   │   ├── index.tsx
    │   │   ├── index.test.tsx
    │   │   ├── BudgetForm.types.ts
    │   │   └── hooks/
    │   │       ├── useBudgetForm.ts
    │   │       ├── useBudgetForm.test.ts
    │   │       ├── useBudgetValidation.ts
    │   │       └── useBudgetValidation.test.ts
    │   ├── BudgetList/
    │   │   ├── index.tsx
    │   │   ├── index.test.tsx
    │   │   ├── BudgetList.types.ts
    │   │   └── hooks/
    │   │       ├── useBudgetList.ts
    │   │       └── useBudgetList.test.ts
    │   └── BudgetChart/
    │       ├── index.tsx
    │       ├── index.test.tsx
    │       └── hooks/
    │           ├── useBudgetChart.ts
    │           └── useBudgetChart.test.ts
    ├── user/
    │   ├── UserProfile/
    │   │   ├── index.tsx
    │   │   ├── index.test.tsx
    │   │   └── hooks/
    │   │       ├── useUserProfile.ts
    │   │       ├── useUserProfile.test.ts
    │   │       ├── useProfileValidation.ts
    │   │       └── useProfileValidation.test.ts
    │   └── UserPermissions/
    │       ├── index.tsx
    │       ├── index.test.tsx
    │       └── hooks/
    │           ├── useUserPermissions.ts
    │           └── useUserPermissions.test.ts
    └── auth/
        ├── LoginForm/
        │   ├── index.tsx
        │   ├── index.test.tsx
        │   └── hooks/
        │       ├── useLoginForm.ts
        │       └── useLoginForm.test.ts
        └── AuthGuard/
            ├── index.tsx
            ├── index.test.tsx
            └── hooks/
                ├── useAuth.ts
                └── useAuth.test.ts

# For shared hooks used across multiple components:
hooks/
├── shared/              # Shared utility hooks
│   ├── useApi.ts
│   ├── useDebounce.ts
│   └── usePagination.ts
└── index.ts             # Export barrel for shared hooks
```

#### Hook Rules and Principles

1. **Separation of Logic and Rendering**: Components handle only rendering, hooks handle all logic and state
2. **Single Responsibility**: Each hook has one clear purpose
3. **Co-location**: Hooks are located within the component directory they serve
4. **Export Structure**: Each component's hooks directory should have an index.ts for clean imports

#### Component Hook Structure Example

```tsx
// components/domain/budget/BudgetForm/hooks/useBudgetForm.ts
export function useBudgetForm(initialData?: Budget) {
  // Hook implementation
}

// components/domain/budget/BudgetForm/hooks/useBudgetValidation.ts
export function useBudgetValidation() {
  // Validation logic
}

// components/domain/budget/BudgetForm/hooks/index.ts
export { useBudgetForm } from './useBudgetForm';
export { useBudgetValidation } from './useBudgetValidation';

// components/domain/budget/BudgetForm/index.tsx
import { useBudgetForm, useBudgetValidation } from './hooks';
```


### 6. Error Boundaries and Error Handling
Implement error boundaries at strategic levels:

```tsx
// components/ErrorBoundary.tsx
export function ErrorBoundary({ children }) {
  return (
    <ErrorBoundaryComponent
      fallback={<ErrorFallback />}
    >
      {children}
    </ErrorBoundaryComponent>
  );
}
```

### 7. Loading States and Suspense
Use Suspense for data fetching and loading states:

```tsx
// app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
```

## Data Fetching Patterns

### Server-Side Data Fetching
Prefer server-side data fetching for initial page loads:

```tsx
// Server Component
async function getServerSideProps() {
  const res = await fetch('http://localhost:8080/api/data');
  return res.json();
}

export default async function Page() {
  const data = await getServerSideProps();
  return <PageContent data={data} />;
}
```

### Client-Side Data Fetching
Use for dynamic interactions and updates:

```tsx
"use client";
import { useState, useEffect } from 'react';

export function ClientDataComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);
  }, []);
  
  return data ? <DataView data={data} /> : <Loading />;
}
```

## API Implementation

### Overview
The API layer is implemented using Next.js API Routes (App Router) following Clean Architecture principles. This ensures separation of concerns, testability, and maintainability of the backend logic.

### Clean Architecture Principles

The API implementation follows the Clean Architecture pattern with four main layers:

```
┌─────────────────────────────────────────────────────┐
│           Presentation Layer (API Routes)           │
│  HTTP Request/Response, Validation, Serialization   │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│           Application Layer (Use Cases)             │
│     Business Logic, Orchestration, Workflows        │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              Domain Layer (Entities)                │
│   Core Business Entities, Domain Rules, Interfaces  │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│       Infrastructure Layer (External Services)      │
│     Database, External APIs, File System, etc.      │
└─────────────────────────────────────────────────────┘
```

### Directory Structure

```
src/
├── app/
│   └── api/                    # Next.js API Routes
│       ├── auth/
│       │   ├── login/
│       │   │   └── route.ts    # POST /api/auth/login
│       │   └── callback/
│       │       └── route.ts    # GET /api/auth/callback
│       ├── tenants/
│       │   ├── route.ts        # GET /api/tenants
│       │   └── [id]/
│       │       ├── route.ts    # GET/PUT/DELETE /api/tenants/:id
│       │       └── members/
│       │           └── route.ts # GET /api/tenants/:id/members
│       ├── budgets/
│       │   ├── route.ts        # GET/POST /api/budgets
│       │   └── [id]/
│       │       └── route.ts    # GET/PUT/DELETE /api/budgets/:id
│       └── users/
│           └── [id]/
│               └── route.ts    # GET/PUT /api/users/:id
├── server/                     # Backend logic (Clean Architecture)
│   ├── domain/                 # Domain Layer
│   │   ├── entities/           # Core business entities
│   │   │   ├── User.ts
│   │   │   ├── Tenant.ts
│   │   │   ├── Budget.ts
│   │   │   └── Permission.ts
│   │   ├── repositories/       # Repository interfaces
│   │   │   ├── IUserRepository.ts
│   │   │   ├── ITenantRepository.ts
│   │   │   └── IBudgetRepository.ts
│   │   └── value-objects/      # Value objects
│   │       ├── Email.ts
│   │       ├── Money.ts
│   │       └── TenantId.ts
│   ├── application/            # Application Layer
│   │   ├── use-cases/          # Business use cases
│   │   │   ├── auth/
│   │   │   │   ├── LoginUseCase.ts
│   │   │   │   └── ValidateTokenUseCase.ts
│   │   │   ├── tenants/
│   │   │   │   ├── CreateTenantUseCase.ts
│   │   │   │   ├── UpdateTenantUseCase.ts
│   │   │   │   └── DeleteTenantUseCase.ts
│   │   │   ├── budgets/
│   │   │   │   ├── CreateBudgetUseCase.ts
│   │   │   │   ├── GetBudgetUseCase.ts
│   │   │   │   └── UpdateBudgetUseCase.ts
│   │   │   └── users/
│   │   │       ├── GetUserProfileUseCase.ts
│   │   │       └── UpdateUserPermissionsUseCase.ts
│   │   ├── dto/                # Data Transfer Objects
│   │   │   ├── requests/
│   │   │   │   ├── CreateTenantRequest.ts
│   │   │   │   └── UpdateBudgetRequest.ts
│   │   │   └── responses/
│   │   │       ├── TenantResponse.ts
│   │   │       └── BudgetResponse.ts
│   │   └── services/           # Application services
│   │       ├── AuthService.ts
│   │       ├── NotificationService.ts
│   │       └── ValidationService.ts
│   └── infrastructure/         # Infrastructure Layer
│       ├── repositories/       # Repository implementations
│       │   ├── UserRepository.ts
│       │   ├── TenantRepository.ts
│       │   └── BudgetRepository.ts
│       ├── database/           # Database configuration
│       │   ├── client.ts       # Database client
│       │   └── migrations/     # Database migrations
│       ├── external/           # External API clients
│       │   ├── MfidApiClient.ts
│       │   └── PaymentApiClient.ts
│       └── adapters/           # Adapters for external services
│           ├── CacheAdapter.ts
│           └── StorageAdapter.ts
```

### Layer Responsibilities

#### 1. Presentation Layer (API Routes)

The presentation layer handles HTTP concerns and delegates business logic to use cases.

```typescript
// app/api/tenants/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CreateTenantUseCase } from '@/server/application/use-cases/tenants/CreateTenantUseCase';
import { TenantRepository } from '@/server/infrastructure/repositories/TenantRepository';
import { createApiResponse, handleApiError } from '@/server/infrastructure/http/apiHelpers';

export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate request
    const body = await request.json();

    // 2. Dependency injection
    const tenantRepository = new TenantRepository();
    const createTenantUseCase = new CreateTenantUseCase(tenantRepository);

    // 3. Execute use case
    const tenant = await createTenantUseCase.execute({
      organizationName: body.organizationName,
      ownerId: body.ownerId,
    });

    // 4. Return response
    return NextResponse.json(
      createApiResponse(tenant, 'Tenant created successfully'),
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const tenantRepository = new TenantRepository();
    const tenants = await tenantRepository.findByUserId(userId);

    return NextResponse.json(
      createApiResponse(tenants, 'Tenants retrieved successfully')
    );
  } catch (error) {
    return handleApiError(error);
  }
}
```

**Presentation Layer Responsibilities:**
- HTTP request/response handling
- Request validation and parsing
- Response serialization
- Error handling and HTTP status codes
- Authentication/authorization checks
- Dependency injection
- Routing

#### 2. Application Layer (Use Cases)

The application layer contains business workflows and orchestrates domain logic.

```typescript
// server/application/use-cases/tenants/CreateTenantUseCase.ts
import { ITenantRepository } from '@/server/domain/repositories/ITenantRepository';
import { Tenant } from '@/server/domain/entities/Tenant';
import { TenantId } from '@/server/domain/value-objects/TenantId';

export interface CreateTenantRequest {
  organizationName: string;
  ownerId: string;
}

export class CreateTenantUseCase {
  constructor(private readonly tenantRepository: ITenantRepository) {}

  async execute(request: CreateTenantRequest): Promise<Tenant> {
    // 1. Validate business rules
    if (!request.organizationName || request.organizationName.trim().length === 0) {
      throw new Error('Organization name is required');
    }

    // 2. Create domain entity
    const tenant = new Tenant({
      id: TenantId.generate(),
      organizationName: request.organizationName,
      ownerId: request.ownerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 3. Persist using repository
    const savedTenant = await this.tenantRepository.save(tenant);

    // 4. Return result
    return savedTenant;
  }
}
```

**Application Layer Responsibilities:**
- Business workflow orchestration
- Business rule validation
- Coordination between domain entities
- Transaction management
- DTO mapping
- Use case implementation

#### 3. Domain Layer (Entities)

The domain layer contains core business entities and rules.

```typescript
// server/domain/entities/Tenant.ts
import { TenantId } from '../value-objects/TenantId';

export interface TenantProps {
  id: TenantId;
  organizationName: string;
  ownerId: string;
  settings?: TenantSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantSettings {
  theme?: string;
  language?: string;
  timezone?: string;
}

export class Tenant {
  private constructor(private readonly props: TenantProps) {
    this.validate();
  }

  static create(props: TenantProps): Tenant {
    return new Tenant(props);
  }

  private validate(): void {
    if (!this.props.organizationName || this.props.organizationName.trim().length === 0) {
      throw new Error('Organization name cannot be empty');
    }

    if (this.props.organizationName.length > 100) {
      throw new Error('Organization name cannot exceed 100 characters');
    }
  }

  // Getters
  get id(): TenantId {
    return this.props.id;
  }

  get organizationName(): string {
    return this.props.organizationName;
  }

  get ownerId(): string {
    return this.props.ownerId;
  }

  get settings(): TenantSettings | undefined {
    return this.props.settings;
  }

  // Business methods
  updateOrganizationName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('Organization name cannot be empty');
    }

    this.props.organizationName = newName;
    this.props.updatedAt = new Date();
  }

  updateSettings(settings: TenantSettings): void {
    this.props.settings = { ...this.props.settings, ...settings };
    this.props.updatedAt = new Date();
  }

  // Serialization
  toJSON(): Record<string, unknown> {
    return {
      id: this.props.id.value,
      organizationName: this.props.organizationName,
      ownerId: this.props.ownerId,
      settings: this.props.settings,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}
```

```typescript
// server/domain/repositories/ITenantRepository.ts
import { Tenant } from '../entities/Tenant';
import { TenantId } from '../value-objects/TenantId';

export interface ITenantRepository {
  save(tenant: Tenant): Promise<Tenant>;
  findById(id: TenantId): Promise<Tenant | null>;
  findByUserId(userId: string): Promise<Tenant[]>;
  delete(id: TenantId): Promise<void>;
  exists(id: TenantId): Promise<boolean>;
}
```

**Domain Layer Responsibilities:**
- Core business entities
- Domain rules and invariants
- Value objects
- Repository interfaces (not implementations)
- Domain events
- Domain services

#### 4. Infrastructure Layer (External Services)

The infrastructure layer implements repository interfaces and external service integrations.

```typescript
// server/infrastructure/repositories/TenantRepository.ts
import { ITenantRepository } from '@/server/domain/repositories/ITenantRepository';
import { Tenant } from '@/server/domain/entities/Tenant';
import { TenantId } from '@/server/domain/value-objects/TenantId';
import { db } from '../database/client';

export class TenantRepository implements ITenantRepository {
  async save(tenant: Tenant): Promise<Tenant> {
    const data = tenant.toJSON();

    const result = await db.tenant.upsert({
      where: { id: data.id as string },
      create: {
        id: data.id as string,
        organizationName: data.organizationName as string,
        ownerId: data.ownerId as string,
        settings: data.settings as Record<string, unknown>,
        createdAt: new Date(data.createdAt as string),
        updatedAt: new Date(data.updatedAt as string),
      },
      update: {
        organizationName: data.organizationName as string,
        settings: data.settings as Record<string, unknown>,
        updatedAt: new Date(data.updatedAt as string),
      },
    });

    return this.toDomain(result);
  }

  async findById(id: TenantId): Promise<Tenant | null> {
    const result = await db.tenant.findUnique({
      where: { id: id.value },
    });

    if (!result) return null;
    return this.toDomain(result);
  }

  async findByUserId(userId: string): Promise<Tenant[]> {
    const results = await db.tenant.findMany({
      where: {
        members: {
          some: { userId }
        }
      },
    });

    return results.map(r => this.toDomain(r));
  }

  async delete(id: TenantId): Promise<void> {
    await db.tenant.delete({
      where: { id: id.value },
    });
  }

  async exists(id: TenantId): Promise<boolean> {
    const count = await db.tenant.count({
      where: { id: id.value },
    });
    return count > 0;
  }

  private toDomain(raw: unknown): Tenant {
    // Map database entity to domain entity
    return Tenant.create({
      id: TenantId.from(raw.id),
      organizationName: raw.organizationName,
      ownerId: raw.ownerId,
      settings: raw.settings,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
```

**Infrastructure Layer Responsibilities:**
- Repository implementations
- Database access
- External API clients
- File system operations
- Caching
- Message queues
- Third-party service integrations

### API Design Patterns

#### 1. Dependency Injection

```typescript
// server/infrastructure/di/container.ts
import { ITenantRepository } from '@/server/domain/repositories/ITenantRepository';
import { TenantRepository } from '@/server/infrastructure/repositories/TenantRepository';
import { CreateTenantUseCase } from '@/server/application/use-cases/tenants/CreateTenantUseCase';

export class DependencyContainer {
  private static repositories = new Map<string, unknown>();
  private static useCases = new Map<string, unknown>();

  static getTenantRepository(): ITenantRepository {
    if (!this.repositories.has('TenantRepository')) {
      this.repositories.set('TenantRepository', new TenantRepository());
    }
    return this.repositories.get('TenantRepository') as ITenantRepository;
  }

  static getCreateTenantUseCase(): CreateTenantUseCase {
    if (!this.useCases.has('CreateTenantUseCase')) {
      this.useCases.set(
        'CreateTenantUseCase',
        new CreateTenantUseCase(this.getTenantRepository())
      );
    }
    return this.useCases.get('CreateTenantUseCase') as CreateTenantUseCase;
  }
}

// Usage in API route
// app/api/tenants/route.ts
import { DependencyContainer } from '@/server/infrastructure/di/container';

export async function POST(request: NextRequest) {
  const useCase = DependencyContainer.getCreateTenantUseCase();
  const result = await useCase.execute(await request.json());
  return NextResponse.json(result);
}
```

#### 2. Error Handling

```typescript
// server/domain/errors/DomainError.ts
export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends DomainError {}
export class ValidationError extends DomainError {}
export class UnauthorizedError extends DomainError {}
export class ForbiddenError extends DomainError {}

// server/infrastructure/http/apiHelpers.ts
import { NextResponse } from 'next/server';
import {
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError
} from '@/server/domain/errors/DomainError';

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  if (error instanceof ValidationError) {
    return NextResponse.json(
      { error: error.message, status: 'error' },
      { status: 400 }
    );
  }

  if (error instanceof UnauthorizedError) {
    return NextResponse.json(
      { error: 'Unauthorized', status: 'error' },
      { status: 401 }
    );
  }

  if (error instanceof ForbiddenError) {
    return NextResponse.json(
      { error: 'Forbidden', status: 'error' },
      { status: 403 }
    );
  }

  if (error instanceof NotFoundError) {
    return NextResponse.json(
      { error: error.message, status: 'error' },
      { status: 404 }
    );
  }

  return NextResponse.json(
    { error: 'Internal server error', status: 'error' },
    { status: 500 }
  );
}

export function createApiResponse<T>(data: T, message = 'Success') {
  return {
    data,
    message,
    status: 'success' as const,
  };
}
```

#### 3. Middleware Pattern

```typescript
// server/infrastructure/middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server';
import { UnauthorizedError } from '@/server/domain/errors/DomainError';

export async function withAuth(
  handler: (request: NextRequest) => Promise<NextResponse>,
  request: NextRequest
): Promise<NextResponse> {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    throw new UnauthorizedError('No authentication token provided');
  }

  // Validate token
  const user = await validateToken(token);

  if (!user) {
    throw new UnauthorizedError('Invalid authentication token');
  }

  // Attach user to request
  (request as any).user = user;

  return handler(request);
}

// Usage
// app/api/protected/route.ts
export async function GET(request: NextRequest) {
  return withAuth(async (req) => {
    const user = (req as any).user;
    return NextResponse.json({ user });
  }, request);
}
```

#### 4. Request Validation

```typescript
// server/application/validation/schemas.ts
import { z } from 'zod';

export const CreateTenantSchema = z.object({
  organizationName: z.string().min(1).max(100),
  ownerId: z.string().uuid(),
});

export const UpdateBudgetSchema = z.object({
  amount: z.number().positive(),
  category: z.string().min(1),
  period: z.enum(['monthly', 'quarterly', 'yearly']),
});

// server/infrastructure/http/validation.ts
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        `Validation failed: ${error.errors.map(e => e.message).join(', ')}`
      );
    }
    throw error;
  }
}

// Usage in API route
import { CreateTenantSchema } from '@/server/application/validation/schemas';
import { validateRequest } from '@/server/infrastructure/http/validation';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validatedData = validateRequest(CreateTenantSchema, body);

  // Use validatedData...
}
```

### Testing Strategy

#### 1. Unit Tests for Use Cases

```typescript
// server/application/use-cases/tenants/__tests__/CreateTenantUseCase.test.ts
import { describe, it, expect, vi } from 'vitest';
import { CreateTenantUseCase } from '../CreateTenantUseCase';
import { ITenantRepository } from '@/server/domain/repositories/ITenantRepository';

describe('CreateTenantUseCase', () => {
  it('should create a tenant successfully', async () => {
    // Arrange
    const mockRepository: ITenantRepository = {
      save: vi.fn().mockResolvedValue(mockTenant),
      findById: vi.fn(),
      findByUserId: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
    };

    const useCase = new CreateTenantUseCase(mockRepository);
    const request = {
      organizationName: 'Test Organization',
      ownerId: 'user-123',
    };

    // Act
    const result = await useCase.execute(request);

    // Assert
    expect(result.organizationName).toBe('Test Organization');
    expect(mockRepository.save).toHaveBeenCalledOnce();
  });

  it('should throw error for empty organization name', async () => {
    // Arrange
    const mockRepository: ITenantRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findByUserId: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
    };

    const useCase = new CreateTenantUseCase(mockRepository);

    // Act & Assert
    await expect(
      useCase.execute({ organizationName: '', ownerId: 'user-123' })
    ).rejects.toThrow('Organization name is required');
  });
});
```

#### 2. Integration Tests for API Routes

```typescript
// app/api/tenants/__tests__/route.test.ts
import { describe, it, expect } from 'vitest';
import { POST } from '../route';

describe('POST /api/tenants', () => {
  it('should create a tenant and return 201', async () => {
    // Arrange
    const request = new Request('http://localhost:3000/api/tenants', {
      method: 'POST',
      body: JSON.stringify({
        organizationName: 'Test Org',
        ownerId: 'user-123',
      }),
    });

    // Act
    const response = await POST(request as any);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(201);
    expect(data.status).toBe('success');
    expect(data.data.organizationName).toBe('Test Org');
  });
});
```

### Best Practices

1. **Separation of Concerns**: Each layer has distinct responsibilities with no leakage
2. **Dependency Rule**: Dependencies point inward (Infrastructure → Application → Domain)
3. **Interface Segregation**: Define interfaces in the domain layer, implement in infrastructure
4. **Single Responsibility**: Each use case handles one business operation
5. **Testability**: Business logic is isolated and easily testable
6. **Type Safety**: Full TypeScript coverage across all layers
7. **Error Handling**: Consistent error handling with domain-specific errors
8. **Validation**: Input validation at boundaries (API routes)
9. **Immutability**: Prefer immutable data structures in domain entities
10. **Documentation**: Document business rules and API contracts

## State Management

### 1. React Built-in State
Use React's built-in state management for:
- Component-level state (useState)
- Complex state logic (useReducer)
- Context for prop drilling avoidance

### 2. URL as State
Leverage Next.js routing for state management:
- Search params for filters
- Route parameters for navigation state
- Hash for in-page state

```tsx
// Using searchParams
function SearchPage({ searchParams }: { searchParams: { q: string } }) {
  const query = searchParams.q;
  return <SearchResults query={query} />;
}
```

## Performance Optimization

### 1. Code Splitting
Leverage Next.js automatic code splitting and dynamic imports:

```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
});
```

### 2. Image Optimization
Use Next.js Image component:

```tsx
import Image from 'next/image';

function ProfileImage() {
  return (
    <Image
      src="/profile.jpg"
      alt="Profile"
      width={500}
      height={300}
      priority
    />
  );
}
```

### 3. Memoization
Use React memoization strategically:

```tsx
import { memo, useMemo, useCallback } from 'react';

const ExpensiveComponent = memo(function ExpensiveComponent({ data }) {
  const processedData = useMemo(() => processData(data), [data]);
  
  const handleClick = useCallback(() => {
    // Handle click
  }, []);
  
  return <div>{/* Component JSX */}</div>;
});
```

## TypeScript Integration

### 1. Strict Type Checking
Enable strict TypeScript configuration:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### 2. Component Props Typing
Use proper TypeScript types for props:

```tsx
type ButtonProps = {
  variant: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

function Button({ variant, size = 'md', children, onClick }: ButtonProps) {
  return (
    <button 
      className={`btn btn-${variant} btn-${size}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### 3. API Response Types
Define types for API responses:

```tsx
// types/api.ts
export type User = {
  id: string;
  email: string;
  name: string;
}

export type ApiResponse<T> = {
  data: T;
  message: string;
  status: 'success' | 'error';
}
```

## Testing Strategy

### 1. Component Testing
Test components in isolation:

```tsx
// __tests__/Button.test.tsx
import { render, screen } from '@testing-library/react';
import Button from '../Button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
});
```

### 2. Integration Testing
Test user workflows and component interactions.

### 3. E2E Testing
Test critical user paths with tools like Playwright.

## Accessibility (a11y)

### 1. Semantic HTML
Use proper HTML semantics:

```tsx
function Navigation() {
  return (
    <nav aria-label="Main navigation">
      <ul>
        <li><a href="/dashboard">Dashboard</a></li>
        <li><a href="/reports">Reports</a></li>
      </ul>
    </nav>
  );
}
```

### 2. ARIA Labels
Provide proper ARIA labels for screen readers:

```tsx
function SearchInput() {
  return (
    <input
      type="search"
      aria-label="Search budgets"
      placeholder="Search..."
    />
  );
}
```

## Security Best Practices

### 1. Content Security Policy
Implement CSP headers in next.config.js.

### 2. Authentication
Handle authentication securely:
- Use HTTP-only cookies for tokens
- Implement CSRF protection
- Validate user permissions on both client and server

### 3. Data Sanitization
Sanitize user inputs and prevent XSS:

```tsx
import DOMPurify from 'dompurify';

function UserContent({ content }: { content: string }) {
  const sanitizedContent = DOMPurify.sanitize(content);
  return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
}
```

## Deployment and Build

### 1. Build Optimization
Configure Next.js for optimal builds:

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;
```

### 2. Environment Configuration
Manage environment variables properly:
- Use `.env.local` for development
- Configure production environment variables securely
- Validate environment variables at build time

## Code Quality

### 1. Biome Configuration
Use Biome for consistent formatting and linting:

```json
// biome.json
{
  "formatter": {
    "enabled": true,
    "formatWithErrors": false,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 80
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  }
}
```

### 2. Git Hooks
Implement pre-commit hooks for code quality:
- Format code with Biome
- Type check with TypeScript
- Run linting rules
- Validate commit messages

This architecture ensures maintainable, performant, and scalable frontend code following Next.js and React best practices while integrating seamlessly with the CPM prototype's business requirements.