---

## unit: 002-valuation-engine
bolt: 004-valuation-engine
stage: model
status: complete
updated: 2026-03-02T18:00:00Z

# Static Model - Valuation Engine (Market Data Fetchers)

## Bounded Context

**Automated Valuation — Market Data**. This context fetches external market data (mutual fund NAV, stock price) and writes Valuation records so that mutual_fund and stocks accounts can have current values without manual entry. It **reads** Account and optional config (scheme code, ticker) and **writes** Valuation; it **calls** external APIs (mfapi.in, Yahoo Finance) and may **cache** results. Same overall valuation-engine context as bolt 003; this bolt adds the market-data side. Ownership: **fetch rules**, **cache policy**, **fallback behaviour**.

## Domain Entities


| Entity              | Properties                                                              | Business Rules                                                                                                                              |
| ------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Account**         | (See portfolio-core)                                                    | Consumed read-only; type mutual_fund or stocks. For MF: account must have an associated scheme code; for stocks: ticker (e.g. RELIANCE.NS). |
| **Valuation**       | (See portfolio-core)                                                    | Written by this context; one new Valuation per successful fetch+compute (date = as-of, valuePaise = units/shares × price/NAV in paise).     |
| **MarketDataCache** | key (e.g. schemeCode or ticker), valuePaiseOrNav, fetchedAt, ttlSeconds | Optional cache entity; key identifies the quote; ttl drives invalidation (e.g. 24h for NAV, 15min for stock).                               |


## Value Objects


| Value Object          | Properties                              | Constraints                                                                   |
| --------------------- | --------------------------------------- | ----------------------------------------------------------------------------- |
| **SchemeCode**        | value: string                           | Non-empty; used for mfapi.in (e.g. "118834").                                 |
| **Ticker**            | value: string                           | NSE: SYMBOL.NS, BSE: SYMBOL.BO (e.g. RELIANCE.NS).                            |
| **NavQuote**          | navPerUnitPaise: number, date: Date     | navPerUnitPaise ≥ 0 (ADR-001: store in paise); date = NAV date.               |
| **StockQuote**        | pricePerSharePaise: number, date: Date  | pricePerSharePaise ≥ 0 (paise); date = quote date.                            |
| **ComputedValuation** | accountId, valuePaise, asOfDate, method | method ∈ { mf, stock }; valuePaise = units × navPaise or shares × pricePaise. |


## Aggregates


| Aggregate Root | Members                                    | Invariants                                                        |
| -------------- | ------------------------------------------ | ----------------------------------------------------------------- |
| *(None new)*   | Account/Valuation owned by portfolio-core. | Cache is infrastructure concern; fetchers are stateless services. |


## Domain Events


| Event                | Trigger                                     | Payload                                                                    |
| -------------------- | ------------------------------------------- | -------------------------------------------------------------------------- |
| **ValuationFetched** | Market data fetched and Valuation persisted | accountId, valuePaise, method (mf | stock), source (api | cache), asOfDate |


## Domain Services


| Service                    | Operations                                  | Dependencies                                                                                                                                                                                            |
| -------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **MFNavFetcher**           | fetchNav(schemeCode) → NavQuote | null      | External: mfapi.in GET; Optional: cache (get/set). On failure return null (caller uses fallback).                                                                                                       |
| **StockPriceFetcher**      | fetchPrice(ticker) → StockQuote | null      | External: Yahoo Finance (or similar) GET; Optional: cache. On failure return null.                                                                                                                      |
| **MFValuationComputer**    | compute(accountId, navQuote) → valuePaise   | Read: Account (units or derive from transactions); valuePaise = units × navPerUnitPaise (in paise). If units not stored, may derive from transactions (investments/withdrawals in units or amount/NAV). |
| **StockValuationComputer** | compute(accountId, stockQuote) → valuePaise | Read: Account / holdings; valuePaise = shares × pricePerSharePaise. Shares may be from account metadata or transactions.                                                                                |


**Note**: Units/shares may be stored on Account (e.g. custom fields) or derived from transactions; design may require account-level config (schemeCode, ticker, units/shares) — see technical design.

## Repository Interfaces


| Repository                     | Entity      | Methods                                                                             |
| ------------------------------ | ----------- | ----------------------------------------------------------------------------------- |
| **AccountReader**              | Account     | findById(accountId) — from portfolio-core.                                          |
| **ValuationWriter**            | Valuation   | create(accountId, date, valuePaise) — from portfolio-core.                          |
| **MarketDataCache** (optional) | Cache entry | get(key), set(key, value, ttlSeconds). Key = "mf:{schemeCode}" or "stock:{ticker}". |


## Ubiquitous Language


| Term            | Definition                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------ |
| **NAV**         | Net Asset Value per unit of a mutual fund scheme; fetched from mfapi.in.                                           |
| **Scheme code** | Identifier for an MF scheme (e.g. mfapi.in uses numeric code). One account per scheme.                             |
| **Ticker**      | Stock symbol and exchange suffix (e.g. RELIANCE.NS for NSE).                                                       |
| **Cache TTL**   | Time-to-live for cached NAV/price; e.g. 24h for NAV, 15min for stock during market hours.                          |
| **Fallback**    | When fetch fails, use last known valuation and surface a warning; do not overwrite with stale or fail the request. |


## Stories Covered by This Model

1 - **004-mf-nav-fetch**: MFNavFetcher.fetchNav(schemeCode); cache 24h; on success compute value = units × NAV, persist Valuation; on failure fallback to last known + warning.
2 - **005-stock-price-fetch**: StockPriceFetcher.fetchPrice(ticker); cache 15min/24h; on success compute value = shares × price, persist Valuation; on failure fallback to last known + warning.

## Constraints from Prior Decisions

- **ADR-001**: All monetary amounts (NAV per unit, price per share, valuePaise) in paise (integer). External APIs typically return rupees; convert at boundary and round.

## External Dependencies (Context)

- **mfapi.in**: GET [https://api.mfapi.in/mf/{schemeCode}](https://api.mfapi.in/mf/{schemeCode}) — returns NAV and date; no key.
- **Yahoo Finance**: Price API (e.g. quote endpoint); ticker format .NS / .BO; rate limits; optional API key (YAHOO_FINANCE_API_KEY).

