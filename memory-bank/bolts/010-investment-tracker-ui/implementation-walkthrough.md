---
stage: implement
bolt: 010-investment-tracker-ui
created: 2026-03-03T02:15:00Z
---

## Implementation Walkthrough: 010-investment-tracker-ui

### Summary

Completed the investment tracker UI with Recharts-based data visualizations (line, bar, pie), a reusable account/date filter component synced to URL params, a responsive sidebar/hamburger layout, and an LLM chat interface with markdown rendering and quick-action buttons. All new pages are auth-gated via RequireAuth.

### Structure Overview

Chart components live in `src/components/charts/`, the filter bar in `src/components/filters/`, and the chat panel in `src/components/InsightChat.tsx`. Two new route pages were added (`/charts` and `/insights`). The existing `Layout.tsx` was enhanced with responsive sidebar and mobile drawer navigation.

### Completed Work

- [x] `src/components/charts/PortfolioLineChart.tsx` - Line chart showing per-account valuations over time with carry-forward logic
- [x] `src/components/charts/AllocationPieChart.tsx` - Pie chart grouped by account type with percentage labels and "Other" bucket for >7 types
- [x] `src/components/charts/ContributionsBarChart.tsx` - Grouped bar chart comparing invested amount vs current value per account
- [x] `src/app/charts/page.tsx` - Charts page with SWR data fetching, filter integration, loading skeletons, and empty states
- [x] `src/components/filters/AccountDateFilter.tsx` - Reusable filter bar with account multi-select dropdown and date range inputs, synced to URL query params
- [x] `src/components/Layout.tsx` - Responsive layout with fixed sidebar on desktop (>=1024px), hamburger menu + slide-out drawer on mobile, nav links for all pages
- [x] `src/components/InsightChat.tsx` - Chat panel with scrollable message list, markdown rendering, quick-action buttons, loading indicator, 503 handling, and history loading on mount
- [x] `src/app/insights/page.tsx` - Insights page wrapping InsightChat in RequireAuth
- [x] `src/types/api.ts` - Extended with HistoryEntry, AccountHistoryResponse, LLMInteraction, InsightsHistoryResponse, InsightsQueryResponse types

### Key Decisions

- **Recharts over Chart.js**: Recharts provides declarative React components that integrate naturally with the component model, avoiding imperative canvas APIs
- **URL param sync for filters**: Using `useSearchParams` + `router.push` so filtered views are shareable and bookmarkable
- **Carry-forward line chart**: For dates where an account has no valuation, the last known value is carried forward rather than showing gaps
- **Local state for chat**: Messages are managed in `useState` rather than SWR since they combine server history with live conversation

### Deviations from Plan

- **Filters not wired into Transactions/Valuations pages**: The plan specified wiring filters into these pages, but they are single-record entry forms (not data lists), so there is nothing to filter. Filters are wired into the Charts page as the primary filterable view.
- **PieChart MAX_SLICES**: Adjusted from 6 to 7 to match the plan's "<=7 shown + Other" specification.

### Dependencies Added

- [x] `recharts@^3.7.0` - Chart rendering library for line, bar, and pie charts
- [x] `react-markdown@^10.1.0` - Markdown rendering for LLM chat responses

### Developer Notes

- The pre-existing test file `tests/api/transactions-valuations-performance.test.ts` has an unrelated TS error (wrong argument count) that predates this bolt
- Accessibility improvements applied: SVG title elements, keyboard support on mobile drawer overlay, htmlFor on filter labels
