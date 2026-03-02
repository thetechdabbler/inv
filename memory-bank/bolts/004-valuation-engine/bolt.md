---
id: 004-valuation-engine
unit: 002-valuation-engine
intent: 001-investment-tracker
type: ddd-construction-bolt
status: complete
stories:
  - 004-mf-nav-fetch
  - 005-stock-price-fetch
created: 2026-03-02T10:35:00.000Z
started: 2026-03-02T18:00:00.000Z
completed: "2026-03-02T15:24:55Z"
current_stage: null
stages_completed:
  - name: model
    completed: 2026-03-02T18:00:00.000Z
    artifact: ddd-01-domain-model.md
  - name: design
    completed: 2026-03-02T18:15:00.000Z
    artifact: ddd-02-technical-design.md
  - name: adr
    completed: 2026-03-02T18:20:00.000Z
    artifact: none
  - name: implement
    completed: 2026-03-02T20:30:00.000Z
    artifact: src/
  - name: test
    completed: 2026-03-02T20:52:00.000Z
    artifact: ddd-03-test-report.md
requires_bolts:
  - 003-valuation-engine
enables_bolts:
  - 009-investment-tracker-ui
requires_units:
  - 001-portfolio-core
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 2
  max_dependencies: 3
  testing_scope: 2
---

# Bolt: 004-valuation-engine

## Overview

Second bolt for the valuation engine. Implements market data fetchers for mutual fund NAVs (mfapi.in) and stock prices (Yahoo Finance).

## Objective

Enable automated valuation updates for traded instruments by fetching live market data from external APIs.

## Stories Included

- **004-mf-nav-fetch**: Fetch MF NAVs from mfapi.in (Should)
- **005-stock-price-fetch**: Fetch stock prices from Yahoo Finance (Should)

## Bolt Type

**Type**: DDD Construction Bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/ddd-construction-bolt.md`

## Stages

- [x] **1. Domain Model**: Complete → ddd-01-domain-model.md
- [x] **2. Technical Design**: Complete → ddd-02-technical-design.md
- [x] **3. ADR Analysis**: Complete (none)
- [x] **4. Implementation**: Complete → src/
- [x] **5. Testing**: Complete → ddd-03-test-report.md

## Dependencies

### Requires
- 003-valuation-engine (calculation infrastructure and patterns)

### Enables
- 009-investment-tracker-ui (displays auto-computed values)

## Success Criteria

- [ ] MF NAVs fetched from mfapi.in with scheme code
- [ ] Stock prices fetched from Yahoo Finance with ticker
- [ ] Caching layer prevents redundant API calls
- [ ] Graceful fallback when APIs unavailable
- [ ] Fetched values create Valuation records
- [ ] Integration tests with mocked API responses

## Notes

- mfapi.in: https://api.mfapi.in/mf/{schemeCode} — free, no key
- Yahoo Finance: SYMBOL.NS for NSE, SYMBOL.BO for BSE
- Cache MF NAVs for 24h, stock prices for 15min during market hours
- Consider a provider abstraction for future data sources
