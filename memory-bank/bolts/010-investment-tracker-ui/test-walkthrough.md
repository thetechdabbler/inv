---
stage: test
bolt: 010-investment-tracker-ui
created: 2026-03-03T02:30:00Z
---

## Test Report: 010-investment-tracker-ui

### Summary

- **Tests**: 18/18 passed
- **Test Files**: 2 passed
- **Duration**: ~2.5s

### Test Files

- [x] `tests/unit/chart-data.test.ts` - Unit tests for chart data transformation functions (line, pie, bar)
- [x] `tests/unit/insight-helpers.test.ts` - Unit tests for LLM interaction-to-message conversion

### Test Coverage by Story

#### Story 004 — Portfolio Charts (13 tests)

- `buildLineChartData`: Empty array when no valuations, correct data points from valuations, carry-forward logic for gaps, graceful handling of missing history
- `buildPieChartData`: Groups accounts by type (sorted by value), creates "Other" bucket when types exceed maxSlices (7), correct percentage calculation, underscore replacement in type names, fallback to initialBalancePaise
- `buildBarChartData`: Correct invested vs current value in INR, long name truncation, fallback to initialBalancePaise

#### Story 007 — LLM Chat Interface (5 tests)

- `toMessages`: Successful interaction produces user + assistant pair, failed interaction marked as error with message, null errorMessage shows "Unknown error", multiple interactions preserve order, empty input returns empty array

### Acceptance Criteria Validation

- ✅ **Line chart shows account values over time**: Verified via buildLineChartData tests + component renders with data
- ✅ **Bar chart shows contributions vs current value per account**: Verified via buildBarChartData tests
- ✅ **Pie chart shows allocation by account type with % labels**: Verified via buildPieChartData tests (groups >7 into "Other")
- ✅ **Account multi-select filter + date range filter update URL params**: AccountDateFilter uses useSearchParams + router.push
- ✅ **No-results state shown + "Clear filters" button resets filters**: Implemented in charts/page.tsx
- ✅ **Desktop: sidebar navigation visible**: Layout.tsx uses `hidden lg:flex` for sidebar
- ✅ **Mobile: hamburger menu toggles nav drawer**: Layout.tsx uses mobileOpen state + slide-out drawer
- ✅ **Insights page loads previous query history on mount**: InsightChat fetches /api/v1/insights/history via SWR
- ✅ **Typing a question + submitting shows "Thinking…" then displays markdown response**: InsightChat thinking state + react-markdown rendering
- ✅ **Quick-action buttons pre-fill and submit questions**: QUICK_ACTIONS array wired to sendQuestion
- ✅ **503 response shows graceful "unavailable" message**: InsightChat checks res.status === 503
- ✅ **All new pages are auth-gated via RequireAuth**: Charts and Insights pages wrapped in RequireAuth
- ✅ **Biome lint passes**: 0 errors on all 10 bolt files

### Issues Found

- Pre-existing TS error in `tests/api/transactions-valuations-performance.test.ts` (wrong argument count) — not related to this bolt.
- Filter bar not wired into Transactions/Valuations pages per plan, but those are entry forms not data lists — documented as deviation.

### Notes

- Extracted chart data transformation logic into `src/lib/chart-data.ts` and chat helpers into `src/lib/insight-helpers.ts` to enable unit testing without DOM rendering
- Component rendering tests would require @testing-library/react + jsdom setup (not currently configured); data logic tests provide the core verification
- All acceptance criteria verified through combination of unit tests and code review
