---
unit: 002-valuation-engine
bolt: 003-valuation-engine
stage: test
status: complete
updated: 2026-03-02T17:45:00Z
---

# Test Report - Valuation Engine (Interest Calculators)

## Test Summary

| Category       | Passed | Failed | Skipped | Coverage |
|----------------|--------|--------|---------|----------|
| Unit           | 0      | 0      | 0       | -        |
| Integration    | 11     | 0      | 0       | -        |
| Security       | 0      | 0      | 0       | -        |
| Performance    | 0      | 0      | 0       | -        |
| **Total (bolt 003)** | **11** | **0** | **0** | N/A      |
| **Total (all)**     | **33** | **0** | **0** | N/A      |

## Acceptance Criteria Validation

| Story                 | Criteria                                               | Status |
|-----------------------|--------------------------------------------------------|--------|
| 001-ppf-calculation   | PPF compute returns 201, creates Valuation; rate per year | ✅     |
| 001-ppf-calculation   | 409 when account type not ppf                          | ✅     |
| 002-epf-calculation   | EPF compute returns 201 with valuePaise               | ✅     |
| 003-deposit-calculation | Deposit compute 400 when no config; 201 when config set | ✅  |
| 003-deposit-calculation | GET/PUT deposit config per account                  | ✅     |
| Rate config           | GET/PUT PPF and EPF rates by financial year           | ✅     |
| Rate config           | Validation (invalid year) → 400                       | ✅     |

## Integration Tests

**File**: `tests/api/valuation-compute-rates.test.ts`

- **GET/PUT /api/v1/valuations/rates/ppf**: Empty list; PUT 2024 7.1%; GET returns rates; invalid year 400.
- **GET/PUT /api/v1/valuations/rates/epf**: PUT and GET rate for year.
- **POST .../compute/ppf/[accountId]**: 404 non-existent; 409 account type mismatch; 201 with valuePaise and Valuation created.
- **POST .../compute/epf/[accountId]**: 201 with valuePaise.
- **GET/PUT .../rates/deposit/[accountId]**: 404 when no config; set and get config.
- **POST .../compute/deposit/[accountId]**: 400 RATE_CONFIG_REQUIRED when no config; 201 when config set.

## Security Tests

Not run. Input validation covered by integration tests. Auth is 004-auth-security.

## Performance Tests

Not run. NFR &lt; 100ms per account to be validated in operations.

## Issues Found

| Issue | Severity | Status |
|-------|----------|--------|
| None | -        | -      |

## Ready for Operations

- [x] Acceptance criteria met for stories 001–003
- [ ] Code coverage &gt; 80% (not measured)
- [x] No critical/high issues open
- [x] Integration tests passing (33 total)
