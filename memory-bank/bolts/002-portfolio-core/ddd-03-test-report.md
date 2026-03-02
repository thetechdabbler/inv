---
unit: 001-portfolio-core
bolt: 002-portfolio-core
stage: test
status: complete
updated: 2026-03-02T16:00:00Z
---

# Test Report - Portfolio Core (Transactions, Valuations, Performance)

## Test Summary

| Category       | Passed | Failed | Skipped | Coverage |
|----------------|--------|--------|---------|----------|
| Unit           | 0      | 0      | 0       | -        |
| Integration    | 13     | 0      | 0       | -        |
| Security       | 0      | 0      | 0       | -        |
| Performance    | 0      | 0      | 0       | -        |
| **Total (bolt 002)** | **13** | **0** | **0** | N/A      |
| **Total (all)**     | **22** | **0** | **0** | N/A      |

## Acceptance Criteria Validation

| Story                 | Criteria                                               | Status |
|-----------------------|--------------------------------------------------------|--------|
| 005-log-investment    | Valid accountId, amountPaise, type=investment → 201   | ✅     |
| 005-log-investment    | Invalid type / non-positive amount → 400               | ✅     |
| 005-log-investment    | Non-existent accountId → 404                           | ✅     |
| 006-log-withdrawal    | Valid withdrawal → 201                                | ✅     |
| 007-log-valuation     | Valid accountId, valuePaise → 201                      | ✅     |
| 007-log-valuation    | Negative valuePaise → 400; bad accountId → 404         | ✅     |
| 008-view-account-history | History returns chronological entries (tx + valuation) | ✅  |
| 008-view-account-history | 404 for non-existent account                        | ✅     |
| 009-compute-performance | Account performance: contributions, netInvested, P&L, percentReturn | ✅ |
| 009-compute-performance | Portfolio performance aggregated                     | ✅     |
| 009-compute-performance | Net invested includes initial balance when no tx    | ✅     |

## Integration Tests

**File**: `tests/api/transactions-valuations-performance.test.ts`

- **POST /api/v1/transactions**: Create investment (201), create withdrawal (201), invalid type (400), zero amount (400), non-existent accountId (404).
- **POST /api/v1/valuations**: Create valuation (201), negative valuePaise (400), non-existent accountId (404).
- **GET /api/v1/accounts/:id/history**: 404 for missing account; 200 with entries in chronological order (investment + valuation types).
- **GET /api/v1/accounts/:id/performance**: 404 for missing account; 200 with totalContributionsPaise, netInvestedPaise, currentValuePaise, profitLossPaise, percentReturn (net invested = initial + contributions - withdrawals).
- **GET /api/v1/portfolio/performance**: 200 with aggregated snapshot.

**File**: `tests/api/accounts.test.ts` (bolt 001, 9 tests) — still passing.

## Security Tests

Not run in this bolt. Input validation (amounts, types, accountId) covered by integration tests. Auth is 004-auth-security.

## Performance Tests

Not run. NFR p95 < 300ms to be validated in operations phase.

## Coverage Report

Coverage not collected. Integration tests cover API surface and main flows for stories 005–009.

## Issues Found

| Issue | Severity | Status |
|-------|----------|--------|
| None | -        | -      |

## Ready for Operations

- [x] All acceptance criteria met for stories 005–009
- [ ] Code coverage > 80% (not measured; 60% target per standards)
- [x] No critical/high severity issues open
- [ ] Performance targets (to be validated later)
- [x] Integration tests passing (22 total)
