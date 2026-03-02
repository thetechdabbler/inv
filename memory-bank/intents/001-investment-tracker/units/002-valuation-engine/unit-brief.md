---
unit: 002-valuation-engine
intent: 001-investment-tracker
phase: inception
status: draft
created: 2026-03-02T10:25:00Z
updated: 2026-03-02T10:25:00Z
---

# Unit Brief: Valuation Engine

## Purpose

Automated valuation service that computes interest-based returns for predictable instruments (PPF, EPF, bank deposits) and fetches market data for traded instruments (mutual funds, stocks). Provides a unified interface for updating account valuations automatically.

## Scope

### In Scope
- PPF interest calculation (7.1% p.a., compounded annually on lowest monthly balance)
- EPF interest calculation (8.25% p.a., monthly compounding, annual crediting)
- Bank deposit interest calculation (user-specified rate and compounding frequency)
- Mutual fund NAV fetching via mfapi.in
- Stock price fetching via Yahoo Finance
- User-overridable interest rates
- Scheduled/on-demand valuation updates

### Out of Scope
- Account CRUD and transaction recording (portfolio-core)
- Manual valuation entry UI (investment-tracker-ui via portfolio-core API)
- NPS valuation (deferred — complex NAV-based calculation)
- Gratuity calculation (deferred — depends on employer rules)

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-4 | Automated Data Fetching and Calculations | Should |

---

## Domain Concepts

### Key Entities
| Entity | Description | Attributes |
|--------|-------------|------------|
| InterestRate | Configurable rate for an instrument type | id, accountType, rate, compoundingFrequency, effectiveFrom |
| MarketDataProvider | External API connector config | provider, baseUrl, apiKey, rateLimit |
| ValuationResult | Computed valuation output | accountId, computedValue, method, calculatedAt |

### Key Operations
| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| calculatePPF | Compute PPF value using govt rate | account, transactions, rate | computedValue |
| calculateEPF | Compute EPF value using official rate | account, transactions, rate | computedValue |
| calculateDeposit | Compute deposit value with user rate | account, rate, frequency | computedValue |
| fetchMFNav | Get latest MF NAV from mfapi.in | schemeCode | navValue, date |
| fetchStockPrice | Get latest stock price from Yahoo | ticker | price, date |
| updateValuation | Auto-update an account's valuation | accountId | Valuation record |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 5 |
| Must Have | 0 |
| Should Have | 5 |
| Could Have | 0 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 001-ppf-calculation | Calculate PPF returns | Should | Planned |
| 002-epf-calculation | Calculate EPF returns | Should | Planned |
| 003-deposit-calculation | Calculate bank deposit returns | Should | Planned |
| 004-mf-nav-fetch | Fetch mutual fund NAVs | Should | Planned |
| 005-stock-price-fetch | Fetch stock prices | Should | Planned |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 001-portfolio-core | Needs Account, Transaction, Valuation models and services |

### Depended By
| Unit | Reason |
|------|--------|
| 005-investment-tracker-ui | Displays auto-computed valuations |

### External Dependencies
| System | Purpose | Risk |
|--------|---------|------|
| mfapi.in | Mutual fund NAV data | Low (free, no key) |
| Yahoo Finance | Stock price data | Medium (rate limits, coverage) |

---

## Technical Context

### Suggested Technology
- Pure TypeScript calculation modules (no external math libs needed for basic compound interest)
- fetch/axios for external API calls
- Next.js API routes under `/api/v1/valuations/compute`

### Integration Points
| Integration | Type | Protocol |
|-------------|------|----------|
| portfolio-core | Internal service | Function calls (Prisma models) |
| mfapi.in | External API | REST / JSON |
| Yahoo Finance | External API | REST / JSON |
| Frontend UI | API | REST (Next.js API routes) |

### Data Storage
| Data | Type | Volume | Retention |
|------|------|--------|-----------|
| Interest Rates | SQL (SQLite) | ~10 records | Permanent |
| Market Data Cache | SQL (SQLite) | ~1K records | 24h TTL |

---

## Constraints

- PPF rate is government-notified and changes annually — must be configurable
- EPF rate changes annually — must be configurable
- mfapi.in has no official SLA — implement caching and fallback
- Yahoo Finance may not cover all Indian stocks — handle missing data gracefully
- Interest calculations must match government formulas within 0.1% accuracy

---

## Success Criteria

### Functional
- [ ] PPF calculation matches government formula (7.1% on lowest monthly balance)
- [ ] EPF calculation matches official formula (8.25%, monthly compounding)
- [ ] Deposit calculation supports monthly/quarterly/annual compounding
- [ ] MF NAVs fetched and portfolio value computed correctly
- [ ] Stock prices fetched and portfolio value computed correctly

### Non-Functional
- [ ] Calculations complete in < 100ms per account
- [ ] Market data cached to avoid redundant API calls
- [ ] Graceful fallback when external APIs are unavailable

### Quality
- [ ] Unit tests verify PPF/EPF calculations against known values
- [ ] Integration tests verify API data parsing
- [ ] Code coverage > 60%

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| 003-valuation-engine | DDD | 001–003 | Interest calculators (PPF, EPF, deposit) |
| 004-valuation-engine | DDD | 004–005 | Market data fetchers (MF, stocks) |

---

## Notes

- PPF formula: interest calculated on lowest balance between 5th and end of each month, compounded annually in March
- EPF formula: monthly interest on running balance, credited to account annually
- Consider making calculators pluggable for future instrument types
