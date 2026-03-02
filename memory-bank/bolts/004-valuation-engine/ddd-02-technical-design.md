---
unit: 002-valuation-engine
bolt: 004-valuation-engine
stage: design
status: complete
updated: 2026-03-02T18:15:00Z
---

# Technical Design - Valuation Engine (Market Data Fetchers)

## Architecture Pattern

**Layered / Clean-style** (same as bolt 003). Next.js API routes as presentation; application use cases orchestrate fetchers, cache, and Valuation write; domain holds fetch/compute logic; infrastructure implements HTTP clients and optional cache. Dependencies inward. Reuses portfolio-core Account and Valuation.

## Layer Structure

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Presentation (Next.js API Routes)                                              │
│  POST /api/v1/valuations/compute/mf/[accountId], .../stock/[accountId]           │
│  GET/PUT /api/v1/accounts/[id]/market-config (schemeCode/ticker, units/shares)  │
│  Validate account exists and type; format response; fallback warning in body     │
├─────────────────────────────────────────────────────────────────────────────────┤
│  Application (Use Cases)                                                         │
│  ComputeMFValuation, ComputeStockValuation — load account + config, fetch       │
│  (or cache), compute value, persist Valuation; on fetch failure return last     │
│  valuation + warning                                                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│  Domain                                                                          │
│  MFNavFetcher, StockPriceFetcher (or provider interface); value = units×NAV,    │
│  shares×price; NavQuote, StockQuote in paise                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│  Infrastructure                                                                  │
│  AccountRepository, ValuationRepository (portfolio-core);                      │
│  AccountMarketConfigRepository (new); HTTP client (fetch); in-memory cache     │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## API Design

| Endpoint | Method | Request | Response |
|----------|--------|---------|----------|
| `POST /api/v1/valuations/compute/mf/[accountId]` | POST | Body (optional): `{ asOfDate?: "YYYY-MM-DD" }` | 201 + `{ valuePaise, asOfDate, method: "mf", source: "api" \| "cache" }` and Valuation created; 200 + `{ valuePaise, asOfDate, method: "mf", source: "fallback", warning: "Fetch failed; showing last known value" }` when fetch fails (no new Valuation); 400 if no scheme code/units config; 404/409 as below |
| `POST /api/v1/valuations/compute/stock/[accountId]` | POST | Body (optional): `{ asOfDate?: "YYYY-MM-DD" }` | Same shape; method "stock"; 400 if no ticker/shares config |
| `GET /api/v1/accounts/[id]/market-config` | GET | — | 200 + `{ schemeCode?, ticker?, units?, shares? }` for mutual_fund/stocks; 404 if not found or type not applicable |
| `PUT /api/v1/accounts/[id]/market-config` | PUT | `{ schemeCode?, ticker?, units?, shares? }` — MF: schemeCode + units; stock: ticker + shares | 200 + saved config; 400 validation; 404 account not found |

All amounts in **paise** (ADR-001). NAV and price from APIs are in rupees; convert to paise (× 100) at boundary and round.

## Data Persistence

| Table | Columns | Relationships |
|-------|---------|---------------|
| **account_market_configs** | id (cuid), accountId (FK, unique), schemeCode (string, nullable), ticker (string, nullable), units (real, nullable), shares (real, nullable), createdAt, updatedAt | accountId → Account.id (onDelete: Cascade). One row per account; for mutual_fund set schemeCode + units; for stocks set ticker + shares. |

**Cache**: In-memory Map with key `mf:{schemeCode}` or `stock:{ticker}`; value = `{ navOrPricePaise, date }`; TTL 24h for MF, 15min for stock (or 24h outside market hours). No persistence across restarts for this bolt.

**Existing**: Account, Valuation (portfolio-core) — read/write as today.

## External Integrations

| Service | Purpose | Integration |
|---------|---------|-------------|
| **mfapi.in** | MF NAV | GET `https://api.mfapi.in/mf/{schemeCode}` — returns `{ data: [ { date, nav } ] }`; use latest entry; no key. Convert nav (rupees) to paise. |
| **Yahoo Finance** | Stock price | Use a quote API (e.g. yahoo-finance2 npm or direct quote endpoint). Ticker format RELIANCE.NS, TCS.BO. Optional env YAHOO_FINANCE_API_KEY. Convert price to paise. If no key, use a free tier or mock for tests. |

## Security Design

| Concern | Approach |
|---------|----------|
| Authentication | Out of scope (004-auth-security). |
| Input validation | schemeCode/ticker non-empty when required; units/shares ≥ 0. Reject 400. |
| External API keys | YAHOO_FINANCE_API_KEY in env; never log or expose in response. |
| Rate limiting | Cache reduces calls; optional per-provider backoff on 429. |

## NFR Implementation

| Requirement | Design Approach |
|-------------|-----------------|
| Cache 24h (NAV), 15min (stock) | In-memory cache with TTL; key by schemeCode/ticker. |
| Fallback when API down | Return last Valuation (from DB) + warning in response; do not create new Valuation. |
| Graceful degradation | Fetcher returns null on timeout/5xx; use case returns 200 + last value + warning. |

## Error Handling

| Error Type | HTTP Code | Response |
|------------|-----------|----------|
| Account not found | 404 | `{ code: "NOT_FOUND", message: "Account not found" }` |
| Account type mismatch (e.g. compute MF for stocks account) | 409 | `{ code: "ACCOUNT_TYPE_MISMATCH", message: "..." }` |
| Missing config (no schemeCode/units or ticker/shares) | 400 | `{ code: "MARKET_CONFIG_REQUIRED", message: "Set scheme code and units for this MF account" }` |
| Validation (invalid units/shares < 0) | 400 | `{ code: "VALIDATION_ERROR", message: "..." }` |
| Fetch failed, no last valuation | 503 | `{ code: "FETCH_FAILED", message: "Could not fetch data; no previous valuation" }` |
| Server error | 500 | `{ code: "INTERNAL_ERROR", message: "..." }` |

## Implementation Notes (Stage 4)

- **Account market config**: New Prisma model AccountMarketConfig (accountId unique); GET/PUT via existing account route or new `/api/v1/accounts/[id]/market-config` to keep account resource cohesive.
- **MF compute**: Load account + config; if no schemeCode/units return 400. Fetch NAV (try cache then mfapi.in); convert nav to paise (nav * 100 round); valuePaise = units * navPaise; create Valuation.
- **Stock compute**: Load account + config; if no ticker/shares return 400. Fetch price (try cache then Yahoo); convert to paise; valuePaise = shares * pricePaise; create Valuation.
- **Fallback**: If fetch returns null, get latest Valuation for account; if exists return 200 + that valuePaise + warning; if no previous valuation return 503.
- **Yahoo Finance**: Use a library (e.g. yahoo-finance2) or fetch from a public quote URL; handle missing key by returning 503 or mock in dev. Document env var in .env.example.
