---
unit: 002-valuation-engine
bolt: 003-valuation-engine
stage: design
status: complete
updated: 2026-03-02T16:45:00Z
---

# Technical Design - Valuation Engine (Interest Calculators)

## Architecture Pattern

**Layered / Clean-style** (same as portfolio-core). Next.js API routes as presentation; application use cases orchestrate domain calculators and repositories; domain holds calculation logic and InterestRateConfig; infrastructure implements Prisma (existing Account/Transaction/Valuation access + new InterestRateConfig table). Dependencies inward. This unit **calls** portfolio-core repositories (read Account, Transaction; write Valuation) and **owns** InterestRateConfig persistence.

## Layer Structure

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Presentation (Next.js API Routes)                                              │
│  /api/v1/valuations/compute/ppf/[accountId], .../epf/[accountId],               │
│  .../deposit/[accountId] — POST compute, optional asOfDate                       │
│  /api/v1/valuations/rates/ppf, .../epf — GET list rates by year; PUT set rate    │
│  /api/v1/valuations/rates/deposit — GET/PUT per account (rate, frequency)       │
│  Validate account exists and type matches; format response; map errors           │
├─────────────────────────────────────────────────────────────────────────────────┤
│  Application (Use Cases)                                                         │
│  ComputePPFValuation, ComputeEPFValuation, ComputeDepositValuation               │
│  GetPPFRates, SetPPFRate, GetEPFRates, SetEPFRate, GetDepositConfig, SetDepositConfig │
│  — load account/transactions, load rate config by year, call calculator, persist  │
├─────────────────────────────────────────────────────────────────────────────────┤
│  Domain                                                                          │
│  PPFCalculator, EPFCalculator, DepositCalculator; InterestRateConfig;           │
│  FinancialYear, compound formula helpers                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│  Infrastructure                                                                  │
│  Existing: AccountRepository, TransactionRepository, ValuationRepository        │
│  New: InterestRateConfigRepository (Prisma); SQLite                              │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## API Design

| Endpoint | Method | Request | Response |
|----------|--------|---------|----------|
| `/api/v1/valuations/compute/ppf/[accountId]` | POST | Body (optional): `{ asOfDate?: "YYYY-MM-DD" }` — default today | 201 + `{ valuePaise, asOfDate, method: "ppf" }` and Valuation created; 400 validation; 404 account not found; 409 account type not ppf |
| `/api/v1/valuations/compute/epf/[accountId]` | POST | Body (optional): `{ asOfDate?: "YYYY-MM-DD" }` | 201 + `{ valuePaise, asOfDate, method: "epf" }` and Valuation created; same errors |
| `/api/v1/valuations/compute/deposit/[accountId]` | POST | Body (optional): `{ asOfDate?: "YYYY-MM-DD" }` — uses account’s configured rate/frequency | 201 + `{ valuePaise, asOfDate, method: "deposit" }` and Valuation created; same errors; 400 if no rate config for account |
| `/api/v1/valuations/rates/ppf` | GET | — | 200 + `{ rates: { financialYear: number, ratePercentPerAnnum: number }[] }` — all configured PPF years |
| `/api/v1/valuations/rates/ppf` | PUT | `{ financialYear: number, ratePercentPerAnnum: number }` | 200 + updated/created config; 400 if rate < 0 or invalid year |
| `/api/v1/valuations/rates/epf` | GET | — | 200 + same shape as PPF for EPF |
| `/api/v1/valuations/rates/epf` | PUT | `{ financialYear: number, ratePercentPerAnnum: number }` | 200 + updated/created config; 400 validation |
| `/api/v1/valuations/rates/deposit/[accountId]` | GET | — | 200 + `{ ratePercentPerAnnum, compoundingFrequency }` or 404 |
| `/api/v1/valuations/rates/deposit/[accountId]` | PUT | `{ ratePercentPerAnnum: number, compoundingFrequency: "monthly" \| "quarterly" \| "annual" }` | 200 + saved config; 400 validation; 404 account not found |

All monetary amounts in response in **paise** (ADR-001). financialYear = calendar year of FY start (e.g. 2024 = FY 2024-25).

## Data Persistence

| Table | Columns | Relationships |
|-------|---------|----------------|
| **interest_rate_configs** | id (cuid), accountType (string: ppf \| epf \| bank_deposit), financialYear (int, nullable for deposit), ratePercentPerAnnum (real), compoundingFrequency (string, nullable), accountId (string, nullable for deposit), effectiveFrom (DateTime, nullable), createdAt, updatedAt | accountId → Account.id (FK, optional). Unique: (accountType, financialYear) for ppf/epf; (accountId) or (accountType, effectiveFrom) for deposit as needed. |

**Existing tables** (portfolio-core): Account, Transaction, Valuation — read/write via existing Prisma client. **New migration**: add `interest_rate_configs`; SQLite stores rate as REAL; indexes on (accountType, financialYear) and (accountId).

## Security Design

| Concern | Approach |
|---------|----------|
| Authentication | Out of scope (004-auth-security); assume authenticated caller. |
| Authorization | Single-user; no per-resource auth. |
| Input validation | accountId valid; asOfDate parseable; ratePercentPerAnnum ≥ 0; financialYear reasonable (e.g. 2000–2100); compoundingFrequency enum. Reject with 400. |
| API versioning | All under `/api/v1/`. |

## NFR Implementation

| Requirement | Design Approach |
|-------------|-----------------|
| Calculation < 100ms per account | In-memory calculation; single read of account + transactions + rate configs; one write for Valuation. No N+1. |
| Accuracy | Use decimal-safe arithmetic for interest (e.g. integer paise + rounding at each step or final round); unit tests with known outputs. |
| Rate config | Single table; lookup by (accountType, financialYear) or by accountId for deposit. |

## Error Handling

| Error Type | HTTP Code | Response |
|------------|-----------|----------|
| Validation (invalid body, rate < 0, bad date) | 400 | `{ code: "VALIDATION_ERROR", message: "..." }` |
| Account not found | 404 | `{ code: "NOT_FOUND", message: "Account not found" }` |
| Account type mismatch (e.g. compute PPF for epf account) | 409 | `{ code: "ACCOUNT_TYPE_MISMATCH", message: "Account is not of type ppf" }` |
| Deposit config missing for account | 400 | `{ code: "RATE_CONFIG_REQUIRED", message: "Set rate and frequency for this deposit account" }` |
| Server error | 500 | `{ code: "INTERNAL_ERROR", message: "..." }` — log, no stack in body. |

## External Dependencies

| Service | Purpose | Integration |
|---------|---------|-------------|
| None (bolt 003) | Interest only; market data in bolt 004. | — |

## Implementation Notes (for Stage 4)

- **Financial year**: FY start year = calendar year of April (e.g. date in April 2024–March 2025 → financialYear 2024). Helper: `getFinancialYear(date: Date) → number`.
- **PPF**: Build month-wise lowest balance (5th vs end-of-month) from transactions + initial balance; for each FY in range apply that year’s rate (from InterestRateConfig); compound annually (March). Default rate 7.1% when no config for that year.
- **EPF**: Build running balance by date; for each month apply monthly rate (annual/12) from that month’s FY config; default 8.25%.
- **Deposit**: Load config for account (rate + frequency); apply A = P(1+r/n)^(nt) from account open/initial balance and each transaction (deposit compounds from its date). Require config before compute.
- **Reuse**: `findAccountById`, `findTransactionsByAccountId`, `createValuation` (or equivalent) from portfolio-core infrastructure; add `InterestRateConfigRepository` in same Prisma schema.
- **Paise**: All amounts in paise; round result of calculations to integer before persisting Valuation (ADR-001).
