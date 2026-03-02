---
id: 005-stock-price-fetch
unit: 002-valuation-engine
intent: 001-investment-tracker
status: complete
priority: should
created: 2026-03-02T10:30:00.000Z
assigned_bolt: 004-valuation-engine
implemented: true
---

# Story: 005-stock-price-fetch

## User Story

**As a** user
**I want** the system to automatically fetch the latest stock price for my equity holdings
**So that** my stock portfolio value stays current without manual updates

## Acceptance Criteria

- [ ] **Given** a stock account with a ticker symbol (e.g., RELIANCE.NS), **When** I trigger price fetch, **Then** the latest price is retrieved from Yahoo Finance
- [ ] **Given** the price is fetched, **When** portfolio value is computed, **Then** current value = shares held × latest price
- [ ] **Given** Yahoo Finance is unavailable, **When** fetch fails, **Then** the system falls back to the last known price and shows a warning

## Technical Notes

- Yahoo Finance ticker format for NSE: SYMBOL.NS (e.g., RELIANCE.NS, TCS.NS)
- Yahoo Finance ticker format for BSE: SYMBOL.BO
- Cache prices for 15 minutes during market hours, 24 hours otherwise
- API key may be required — configure via YAHOO_FINANCE_API_KEY env var
- API route: POST /api/v1/valuations/compute/stock/:accountId

## Dependencies

### Requires
- portfolio-core unit (Account, Transaction, Valuation models)

### Enables
- None directly

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Invalid ticker symbol | Return error with message |
| Market closed (weekend/holiday) | Use last closing price |
| Stock delisted | Return error, suggest manual valuation |
| API key not configured | Return error with setup instructions |

## Out of Scope

- Real-time streaming prices
- Order book or depth data
- Dividend tracking
- Stock split adjustments
