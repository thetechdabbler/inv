---
stage: test
bolt: 017-account-detail-filtering
created: 2026-03-03T21:15:00Z
---

## Test Report: Account Detail & Filtering

### Summary

- **Tests**: 26/26 passed (bolt scope); full suite 465 passed, 2 failed (pre-existing in valuations API)
- **Coverage**: Bolt scope covered by structure tests; no coverage percentage computed for this unit

### Test Files

- [x] `tests/unit/account-detail-filtering-structure.test.ts` - Verifies account detail page exists, tabs (Overview, Transactions, Valuations, History), Edit link, back link, TransactionItem/ValuationItem/HistoryChart; account listing and dashboard link to `/accounts/{id}`; transactions and valuations pages import and render AccountDateFilter and filter by URL params

### Acceptance Criteria Validation

- ✅ **/accounts/{id} page with Overview, Transactions, Valuations, History tabs**: Verified by structure tests (tab values and content)
- ✅ **Account listing cards link to /accounts/{id}**: Verified (accounts page and dashboard)
- ✅ **Edit button on detail page links to /accounts/{id}/edit**: Verified (contains /edit and Settings)
- ✅ **Transactions page has AccountDateFilter**: Verified (import, render, filterAccountIds, filteredTransactions, filtered indicator)
- ✅ **Valuations page has AccountDateFilter**: Verified (import, render, filterAccountIds, filteredValuations, filtered indicator)
- ✅ **Filter state persisted in URL params**: Verified (useSearchParams, filterAccountIds, from, to in both pages)

### Issues Found

- Full test suite: 2 failing tests in `tests/api/transactions-valuations-performance.test.ts` and `tests/api/valuation-compute-rates.test.ts` (500 responses). These are outside bolt 017 scope (valuations/create and rates APIs).

### Notes

- No new unit or integration tests were added; existing structure test file fully covers bolt deliverables.
- API tests for GET /api/v1/accounts/[id] and GET /api/v1/accounts/[id]/history exist elsewhere and are part of the passing suite.
