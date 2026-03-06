# Test Walkthrough — Bolt 024-insights-ux

## Test Scope

Bolt 024 is a UI-only bolt (`testing_scope: 1`). No new unit tests were added. Existing tests confirm no regressions.

## Regression Test Results

```
Test Files  28 passed (29 — 1 pre-existing failure)
Tests       554 passed (555 — 1 pre-existing failure in valuation-gratuity.test.ts)
```

### Pre-existing failure (unrelated)
- `tests/unit/valuation-gratuity.test.ts` — off-by-one in years-of-service calculation; pre-dates this bolt.

## Biome Lint

```
npx biome check src/components/insights/ src/app/insights/ src/app/api/v1/insights/history/
Checked 5 files in 22ms. No fixes applied.
```

All lint rules pass including a11y (`noLabelWithoutControl` — labels have `htmlFor`), style (`useTemplate`), and React hooks (`useExhaustiveDependencies`).

## TypeScript

Pre-existing errors in `compute-projections.ts` and one test file. No new errors introduced by bolt 024.

## Manual Test Scenarios

| Scenario | Expected |
|---|---|
| `/insights` loads | History tab active, list fetched |
| Switch to Chat tab | URL becomes `?tab=chat`, InsightChat renders |
| Link "Chat tab" in empty state | Navigates to chat tab |
| Apply date filter | URL updates, SWR re-fetches with `from`/`to` params |
| Clear filters | URL reverts to `/insights`, full list re-fetches |
| Click type tab | URL updates `?insightType=...`, list filters to that type |
| "Load more" | Next page appended, no duplicates |
| "Re-run" on card | Navigates to `/insights?tab=chat` |
| "View projections" on projection card | Navigates to `/projections` |
| Click external link icon | Opens `/insights/:id` detail page |
| Detail page with valid auditId | Shows narrative + metadata |
| Detail page with invalid auditId | 404 page |
| Projection-type insight detail | Shows "View current projections" card |
