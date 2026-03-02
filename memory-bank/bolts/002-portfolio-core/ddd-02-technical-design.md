---
unit: 001-portfolio-core
bolt: 002-portfolio-core
stage: design
status: complete
updated: 2026-03-02T15:10:00Z
---

# Technical Design - Portfolio Core (Transactions, Valuations, Performance)

## Architecture Pattern

**Layered / Clean-style** (same as bolt 001). Next.js API routes as presentation; application use cases orchestrate domain logic and existing repositories; domain holds entities, value objects, and service concepts; infrastructure remains Prisma + SQLite. New use cases: LogTransaction, LogValuation, GetAccountHistory, GetAccountPerformance, GetPortfolioPerformance. Dependencies inward; no new infrastructure beyond existing Transaction and Valuation repository usage.

## Layer Structure

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  Presentation (Next.js API Routes)                                          │
│  /api/v1/transactions (POST), /api/v1/valuations (POST),                    │
│  /api/v1/accounts/[id]/history (GET), /api/v1/accounts/[id]/performance     │
│  (GET), /api/v1/portfolio/performance (GET) — validate, call use case,    │
│  format JSON, map errors to HTTP status                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  Application (Use Cases)                                                    │
│  LogTransaction, LogValuation, GetAccountHistory, GetAccountPerformance,     │
│  GetPortfolioPerformance — orchestrate Account/Transaction/Valuation         │
│  repositories, enforce validation, compute aggregates                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  Domain                                                                      │
│  Transaction/Valuation entities (existing), value objects (HistoryEntry,    │
│  PerformanceSnapshot), domain service concepts from ddd-01                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  Infrastructure                                                              │
│  Existing PrismaTransactionRepository, PrismaValuationRepository,           │
│  PrismaAccountRepository; SQLite via Prisma (schema unchanged)              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## API Design

| Endpoint | Method | Request | Response |
|----------|--------|---------|----------|
| `/api/v1/transactions` | POST | `{ accountId, date?, amountPaise, type, description? }` — type ∈ { investment, withdrawal }, amountPaise positive integer, date ISO date string (default today) | 201 + `{ id, accountId, date, amountPaise, type, description, createdAt }` or 400 validation / 404 account not found |
| `/api/v1/valuations` | POST | `{ accountId, date?, valuePaise }` — valuePaise non-negative integer, date optional (default today) | 201 + `{ id, accountId, date, valuePaise, createdAt }` or 400 / 404 |
| `/api/v1/accounts/:id/history` | GET | Query: `from?`, `to?` (ISO date), `limit?`, `cursor?` for pagination | 200 + `{ entries: HistoryEntry[], nextCursor? }` — each entry: `{ date, type, amountOrValuePaise, description?, createdAt }` type ∈ { investment, withdrawal, valuation }; 404 if account not found |
| `/api/v1/accounts/:id/performance` | GET | — | 200 + `{ totalContributionsPaise, totalWithdrawalsPaise, netInvestedPaise, currentValuePaise, profitLossPaise, percentReturn }` (percentReturn number or null); 404 if not found |
| `/api/v1/portfolio/performance` | GET | — | 200 + same shape as account performance, aggregated across all accounts |

**Validation**: accountId required and must exist; amountPaise > 0 for transactions; valuePaise ≥ 0 for valuations; type enum for transactions. **List accounts** (existing GET /api/v1/accounts): already returns currentValuePaise and totalContributionsPaise; ensure list use case uses TransactionRepository to compute totalContributions (sum of investments) and ValuationRepository for current value (bolt 002 implementation).

## Data Persistence

Schema unchanged from bolt 001. Confirmed usage for this bolt:

| Table | Usage in this bolt |
|-------|--------------------|
| **Account** | findById / exists for validation before creating transaction/valuation; findAll for portfolio performance |
| **Transaction** | create (POST transaction); findByAccountId (history, performance sums). Index (accountId, date) for range queries. |
| **Valuation** | create (POST valuation); findLatestByAccountId (current value, performance); findByAccountId (history). Index (accountId, date). |

No new tables or migrations. Prisma schema already has Transaction and Valuation with FK to Account and cascade delete.

## Security Design

| Concern | Approach |
|---------|----------|
| Authentication | Same as bolt 001; out of scope here; auth in 004-auth-security. |
| Authorization | Single-user; no per-resource checks in this bolt. |
| Input validation | API layer: accountId present and valid UUID/cuid; amountPaise integer > 0 (transactions); valuePaise integer ≥ 0; type in [investment, withdrawal]; date parseable or default. Reject with 400. |
| API versioning | All under `/api/v1/`. |

## NFR Implementation

| Requirement | Design Approach |
|-------------|-----------------|
| Performance (p95 < 300ms) | Indexes on Transaction(accountId, date), Valuation(accountId, date); history and performance use single or batched queries; pagination for history (limit + cursor by date/createdAt) to cap response size. |
| Scalability | Same as 001; SQLite, 100K+ transactions acceptable. |
| Reliability | Single Prisma writes for transaction/valuation; read-only for history/performance; no multi-entity write transaction required beyond existing. |

## Error Handling

| Error Type | HTTP Code | Response |
|------------|-----------|----------|
| Validation (invalid body or query) | 400 | `{ code: "VALIDATION_ERROR", message: "..." }` |
| Account not found (POST transaction/valuation with bad accountId; GET history/performance for missing id) | 404 | `{ code: "NOT_FOUND", message: "Account not found" }` |
| Server error | 500 | `{ code: "INTERNAL_ERROR", message: "..." }` — log, no stack in body. |

Reuse same error shape and mapping as bolt 001.

## External Dependencies

| Service | Purpose | Integration |
|---------|---------|-------------|
| None | Self-contained; persistence via existing Prisma/SQLite. | — |

## Implementation Notes (for Stage 4)

- **Application use cases**: `log-transaction.ts` (validate account exists, create Transaction); `log-valuation.ts` (validate account exists, create Valuation); `get-account-history.ts` (findByAccountId for both repos, merge, sort by date then createdAt, apply date range, paginate); `get-account-performance.ts` (sum investments, sum withdrawals, latest valuation or initial balance, compute P&L and percentReturn); `get-portfolio-performance.ts` (aggregate all accounts’ contributions, withdrawals, current values, P&L; portfolio percentReturn = aggregate P&L / aggregate netInvested when > 0, else null).
- **API routes**: `src/app/api/v1/transactions/route.ts` (POST); `src/app/api/v1/valuations/route.ts` (POST); `src/app/api/v1/accounts/[id]/history/route.ts` (GET); `src/app/api/v1/accounts/[id]/performance/route.ts` (GET); `src/app/api/v1/portfolio/performance/route.ts` (GET).
- **List accounts**: Update existing list-accounts use case to compute totalContributionsPaise from TransactionRepository (sum of type=investment) and currentValuePaise from ValuationRepository (latest) so list response remains accurate after bolt 002.
- **History pagination**: Cursor-based by (date, createdAt) or offset limit; document in API. Default page size e.g. 50.
- **Paise**: All amounts in request/response in paise (integer); ADR-001.
