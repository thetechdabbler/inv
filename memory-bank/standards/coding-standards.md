# Coding Standards

## Overview
Practical, TypeScript-first coding standards emphasizing consistency, domain-driven organization, and automated quality enforcement via Biome.

## Code Formatting

**Tool**: Biome
**Key Settings**:
- Indentation: 2 spaces
- Line length: 80 characters
- Trailing commas: all
- Semicolons: always
- Quote style: double

**Enforcement**: On save and pre-commit

## Linting

**Tool**: Biome (integrated with formatter)
**Strictness**: Balanced — recommended rules enabled, warnings for non-critical issues

**Key Rules**:
- No `any` type: warn
- Unused variables: warn
- No explicit `any`: warn
- Consistent imports: error
- No console in production: warn

## Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Variables / Functions | camelCase | `userName`, `getUserById` |
| Classes / Types / Interfaces | PascalCase | `UserService`, `ApiResponse` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES`, `API_URL` |
| React Components | PascalCase | `UserProfile`, `Header` |
| React Hooks | camelCase with `use` | `useAuth`, `useLocalStorage` |
| Booleans | `is`/`has`/`can` prefix | `isActive`, `hasPermission` |

**File Naming**:
- Components: PascalCase (`UserProfile.tsx`)
- Utilities: kebab-case (`date-utils.ts`)
- Tests: co-located (`UserService.test.ts`) or in `tests/` for integration/e2e

## File Organization

**Pattern**: Domain-Driven

**Structure**:
```text
src/
  domain/
    user/
    order/
    payment/
  application/
    services/
    use-cases/
  infrastructure/
    database/
    api/
    external/
  shared/
    components/
    hooks/
    utils/
```

**Conventions**:
- Unit tests: co-located next to source files
- Integration/E2E tests: `tests/` directory at project root
- Types: co-located within their domain module
- Index files: used for public API of each module

## Testing Strategy

**Framework**: Vitest
**Coverage Target**: 60%

**Test Types**:

| Type | Tool | When to Use |
|------|------|-------------|
| Unit | Vitest | Individual functions, hooks, utilities |
| Integration | Vitest | Module interactions, API routes |
| Component | Testing Library | React components in isolation |
| E2E | Playwright | Full user flows, critical paths |

**Conventions**:
- Test naming: `it('should ...')` for behavior descriptions
- Test structure: Arrange-Act-Assert
- Mock strategy: Mock at boundaries (external services, database), avoid mocking internal modules

## Error Handling

**Pattern**: Try/catch with custom error classes

**Custom Errors**: Yes — domain-specific error classes extending a base `AppError`

**API Errors**: Consistent JSON format with status code, error code, and message

**Conventions**:
- Throw custom errors in domain/application layers
- Catch and transform at API boundary
- React error boundaries for component-level failures
- Always include context in error messages

## Logging

**Tool**: Pino
**Format**: Structured JSON

**Levels**:

| Level | Usage |
|-------|-------|
| error | Failures requiring attention |
| warn | Unexpected but handled situations |
| info | Significant business events |
| debug | Detailed technical info (dev only) |

**Rules**:
- Always log: API requests, auth events, business events, errors with context
- Never log: Passwords, tokens, API keys, PII without consent
