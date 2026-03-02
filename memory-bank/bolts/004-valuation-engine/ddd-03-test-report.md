---
unit: 002-valuation-engine
bolt: 004-valuation-engine
stage: test
status: complete
updated: 2026-03-02T20:52:00Z
---

# Test Report - Valuation Engine (Bolt 004: Market Data Fetchers)

## Test Summary

| Category       | Passed | Failed | Skipped | Coverage |
|----------------|--------|--------|---------|----------|
| Unit           | —      | —      | —       | —        |
| Integration    | 17 (bolt 004) + 33 (existing) | 0 | 0 | —        |
| Security       | —      | —      | —       | —        |
| Performance    | —      | —      | —       | —        |
| **Total (bolt 004)** | **17** | **0** | **0** | —        |

Bolt 004 adds 17 integration tests in `tests/api/valuation-compute-mf-stock-market-config.test.ts`. Full suite: 50 tests, all passing.

## Acceptance Criteria Validation

| Story              | Criteria | Status |
|--------------------|----------|--------|
| 004-mf-nav-fetch   | Compute MF with schemeCode + units; 201 on success; 200 + warning on fetch failure with previous valuation; 503 when fetch fails and no previous valuation; 404/409/400 as designed | ✅ |
| 005-stock-price-fetch | Compute stock with ticker + shares; same response shape and status codes as MF | ✅ |
| (market-config)    | GET/PUT /api/v1/accounts/[id]/market-config; 404 when no config or account missing; validation for units/shares ≥ 0 | ✅ |

## Integration Tests (Bolt 004)

**Market config**

- GET 404 for non-existent account
- GET 404 when account exists but has no market config
- PUT then GET 200 for mutual_fund (schemeCode, units)
- PUT then GET 200 for stocks (ticker, shares)
- PUT 400 for negative units or negative shares

**POST compute/mf/[accountId]**

- 404 for non-existent account
- 409 when account type is not mutual_fund
- 400 when market config missing (no schemeCode/units)
- 201 when fetchNav returns quote (mocked); valuePaise and Valuation created
- 200 with fallback when fetchNav fails but previous valuation exists (mocked null)
- 503 when fetchNav fails and account has no previous valuation (account created without initial valuation)

**POST compute/stock/[accountId]**

- 404 for non-existent account
- 409 when account type is not stocks
- 400 when market config missing (no ticker/shares)
- 201 when fetchPrice returns quote (mocked); valuePaise and Valuation created
- 503 when fetchPrice fails and no previous valuation

External fetchers (mfapi.in, Yahoo) are mocked so tests are deterministic and do not call live APIs.

## Security Tests

Not run in this bolt. Authentication is out of scope (007-auth-security). Input validation (units/shares ≥ 0, config required) covered by integration tests.

## Performance Tests

Not run. Cache TTL and fallback behaviour are implemented per design; load/stress not in scope for this bolt.

## Issues Found

- **get-market-config**: When no config row existed, the use case returned `{ schemeCode: null, ... }` instead of `null`, so the API returned 200 instead of 404. Fixed: return `null` when config row is missing.
- **503 tests**: New accounts get an initial valuation (valuePaise = initialBalancePaise) from create-account. So “no previous valuation” never held for accounts created via POST /accounts. Tests that assert 503 use Prisma to create an account without creating a valuation so the 503 path is exercised.

## Ready for Operations

- [x] All acceptance criteria met for stories 004–005
- [ ] Code coverage > 80% (not measured for this bolt only)
- [x] No critical/high severity issues open
- [x] Integration tests passing
