---
unit: 001-portfolio-core
bolt: 001-portfolio-core
stage: design
status: complete
updated: 2026-03-02T10:55:00Z
---

# Technical Design - Portfolio Core (Account CRUD)

## Architecture Pattern

**Layered / Clean-style** — Next.js API routes as the presentation layer; application layer (use cases) orchestrates domain services and repositories; domain layer holds entities, value objects, and domain logic; infrastructure layer implements Prisma repositories and SQLite persistence. Dependencies point inward: API → application → domain; infrastructure implements domain repository interfaces. Fits project standards (domain-driven file organization) and keeps API routes thin.

## Layer Structure

```text
┌─────────────────────────────────────────────────────────────┐
│  Presentation (Next.js API Routes)                          │
│  /api/v1/accounts/* — parse request, validate, call use     │
│  case, format response, map errors to HTTP status            │
├─────────────────────────────────────────────────────────────┤
│  Application (Use Cases)                                    │
│  CreateAccount, ListAccounts, UpdateAccount, DeleteAccount   │
│  — orchestrate domain + repositories, enforce confirm flag   │
├─────────────────────────────────────────────────────────────┤
│  Domain                                                      │
│  Account entity, value objects (AccountType, Money),        │
│  AccountService (optional facade), domain events            │
├─────────────────────────────────────────────────────────────┤
│  Infrastructure                                              │
│  PrismaAccountRepository, PrismaValuationRepository,        │
│  PrismaTransactionRepository, SQLite via Prisma             │
└─────────────────────────────────────────────────────────────┘
```

## API Design

| Endpoint | Method | Request | Response |
|----------|--------|---------|----------|
| `/api/v1/accounts` | POST | `{ type, name, description?, initialBalancePaise }` — type enum, name string 1–100, initialBalancePaise non-negative integer | 201 + `Account` (id, type, name, description, initialBalancePaise, createdAt, updatedAt) or 400 validation error |
| `/api/v1/accounts` | GET | (optional) query params for future filtering | 200 + `{ accounts: AccountListItem[] }` — each: id, type, name, description, initialBalancePaise, currentValuePaise (from latest Valuation), totalContributionsPaise (sum investments; for this bolt can be initial only), createdAt, updatedAt |
| `/api/v1/accounts/:id` | PATCH | `{ name?, description?, type? }` — partial | 200 + updated `Account` or 404 / 400 |
| `/api/v1/accounts/:id` | DELETE | Query: `confirm=true` required | 204 no content or 400 if confirm missing, 404 if not found |

**Request validation**: type in enum; name non-empty, max 100; initialBalancePaise integer ≥ 0; description optional string. **Response shape**: Consistent JSON; errors as `{ code: string, message: string }` per coding standards.

## Data Persistence

| Table | Columns | Relationships |
|-------|---------|---------------|
| **Account** | id (cuid/uuid), type (enum), name (string), description (string?), initialBalancePaise (int), createdAt (DateTime), updatedAt (DateTime) | One-to-many Transaction, one-to-many Valuation; onDelete: Cascade for both |
| **Transaction** | id, accountId (FK), date (DateTime), amountPaise (int), type (enum: investment \| withdrawal), description (string?), createdAt | accountId → Account.id (Cascade) |
| **Valuation** | id, accountId (FK), date (DateTime), valuePaise (int), createdAt | accountId → Account.id (Cascade) |

**ORM**: Prisma. **Database**: SQLite (project standard). **Migrations**: Prisma migrate. Indexes: `Account(type)`, `Transaction(accountId, date)`, `Valuation(accountId, date)` for list/history and latest-value lookups. Monetary columns as integers (paise).

## Security Design

| Concern | Approach |
|---------|----------|
| Authentication | Not in scope for this bolt; auth (passphrase/session) implemented in 004-auth-security. API routes assume caller is authenticated once middleware is in place. |
| Authorization | Single-user app; no per-resource auth in this bolt. |
| Data validation | Input validated at API layer (type, name length, initialBalancePaise ≥ 0); reject invalid with 400. |
| API versioning | All routes under `/api/v1/` per requirements. |

## NFR Implementation

| Requirement | Design Approach |
|-------------|-----------------|
| Performance (p95 < 300ms) | Indexes on accountId and date for Transaction/Valuation; list accounts with single query + batched latest-valuation per account or subquery; avoid N+1. |
| Scalability | Single SQLite file; sufficient for 50+ accounts, 100K+ transactions (project constraint). No sharding. |
| Reliability | Prisma transactions for create-account + initial valuation; cascade delete in DB for consistency. |

## Error Handling

| Error Type | HTTP Code | Response |
|------------|-----------|----------|
| Validation (invalid body or query) | 400 | `{ code: "VALIDATION_ERROR", message: "..." }` |
| Account not found (GET/PATCH/DELETE :id) | 404 | `{ code: "NOT_FOUND", message: "Account not found" }` |
| Delete without confirm=true | 400 | `{ code: "CONFIRM_REQUIRED", message: "..." }` |
| Server error | 500 | `{ code: "INTERNAL_ERROR", message: "..." }` — log with Pino, no stack in response. |

Use project-standard custom errors and map at API boundary to status + JSON body.

## External Dependencies

| Service | Purpose | Integration |
|---------|---------|-------------|
| None | This bolt is self-contained; persistence is local SQLite via Prisma. | — |

## Implementation Notes (for Stage 4)

- **Project layout**: Under `src/` (or app-relative): `domain/portfolio/` (entities, types), `application/portfolio/` (use cases), `infrastructure/prisma/` (repositories, schema), `app/api/v1/accounts/` or `pages/api/v1/accounts/` for route handlers.
- **Create flow**: In one Prisma transaction: insert Account, then insert Valuation (accountId, date=now, valuePaise=initialBalancePaise).
- **List flow**: findMany Account; for each (or batched), get latest Valuation per account and optionally total contributions (sum of investment transactions); for bolt 001, totalContributions can be 0 or initialBalancePaise until bolt 002.
- **Delete flow**: Require `confirm=true` in query; then Prisma delete Account (cascade removes Transaction and Valuation).
- **Paise**: Store and transport all amounts as integers; document in API that amounts are in paise (frontend can convert to INR for display).
