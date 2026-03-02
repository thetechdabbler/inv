---
stage: plan
bolt: 010-investment-tracker-ui
created: 2026-03-03T01:30:00Z
---

## Implementation Plan: 010-investment-tracker-ui

### Objective

Complete the investment tracker UI with data visualisations (line/bar/pie charts), filtering by account and date range, responsive layout (sidebar + hamburger), and an LLM chat interface backed by the /insights/query API.

---

### Deliverables

#### Story 004 — Portfolio Charts
- `recharts` installed as a dependency
- `src/components/charts/PortfolioLineChart.tsx` — account values over time (per-account series, x=date, y=value in ₹)
- `src/components/charts/AllocationPieChart.tsx` — allocation by account type (slices with percentage labels, ≤7 shown + "Other")
- `src/components/charts/ContributionsBarChart.tsx` — contributions vs current value per account (grouped bars)
- `src/app/charts/page.tsx` — Charts page (auth-gated, fetches data, renders the three chart components)

#### Story 005 — Filtering and Search
- `src/components/filters/AccountDateFilter.tsx` — reusable filter bar: account multi-select dropdown + date-from/date-to inputs
- Filter state synced to URL query params (`?accountIds=a,b&from=2025-01-01&to=2025-12-31`) so links are shareable
- Filter bar wired into Charts page (charts re-render on filter change)
- Filter bar wired into Transactions page and Valuations page (client-side list filtering)
- "No results" empty state + "Clear filters" button

#### Story 006 — Responsive Layout
- `src/components/Layout.tsx` — refactored to responsive:
  - Desktop (≥1024px): left sidebar, fixed 200px, with nav links and logout
  - Mobile (<1024px): top bar with hamburger button, slide-down nav drawer
  - Tailwind `lg:` prefix breakpoints throughout
- Layout nav extended: add "Charts" and "Insights" links

#### Story 007 — LLM Chat Interface
- `react-markdown` installed as a dependency
- `src/app/insights/page.tsx` — Insights chat page (auth-gated)
- `src/components/InsightChat.tsx` — chat panel:
  - Scrollable message list (user messages + LLM bubbles with markdown rendering)
  - Text input + submit button
  - Quick-action buttons: "Summarise portfolio", "Risk analysis", "Project 10 years"
  - Loading indicator ("Thinking…") during API call
  - Error state with retry
  - Loads previous queries from `GET /api/v1/insights/history` on mount
  - Sends `POST /api/v1/insights/query` on submit
  - 503 (no API key) → "AI insights unavailable — no OpenAI key configured."

---

### Dependencies

- `recharts@^2` — chart rendering (not installed, needs `npm install`)
- `react-markdown@^9` — LLM response markdown (not installed, needs `npm install`)
- `GET /api/v1/accounts` — account list for pie chart + filter dropdown
- `GET /api/v1/accounts/:id/history?from=&to=&limit=500` — per-account valuation/transaction history for line + bar charts
- `GET /api/v1/portfolio/performance` — totals for bar chart aggregation
- `POST /api/v1/insights/query` — NL query endpoint
- `GET /api/v1/insights/history` — previous query history on chat load

---

### Technical Approach

- Charts fetch data inside `src/app/charts/page.tsx` via SWR; per-account history fetched in parallel with `useSWR` keyed by account ID
- Line chart data: group valuation history entries by account, sorted by date
- Bar chart data: per-account — invested (sum of investment transactions) vs current value
- Pie chart data: derived from `AccountListItem.currentValuePaise` grouped by `type`
- Filter component: controlled by `useSearchParams` (Next.js) + `router.push` for URL sync; typed inputs with date validation
- Responsive Layout: sidebar uses `hidden lg:flex` / `flex lg:hidden` Tailwind classes; mobile drawer uses React `useState` for open/closed
- InsightChat: local `useState` for message list; appends history records from GET on mount; sends POST and appends response bubble; uses `react-markdown` for response rendering

---

### Acceptance Criteria

- [ ] Line chart shows account values over time; empty state shown when no valuations
- [ ] Bar chart shows contributions vs current value per account
- [ ] Pie chart shows allocation by account type with % labels; groups >7 accounts into "Other"
- [ ] Account multi-select filter + date range filter update URL params and re-filter charts/lists
- [ ] No-results state shown + "Clear filters" button resets filters
- [ ] Desktop: sidebar navigation visible
- [ ] Mobile: hamburger menu toggles nav drawer
- [ ] Insights page loads previous query history on mount
- [ ] Typing a question + submitting shows "Thinking…" then displays markdown response
- [ ] Quick-action buttons pre-fill and submit questions
- [ ] 503 response shows graceful "unavailable" message
- [ ] All new pages are auth-gated via `RequireAuth`
- [ ] Biome lint passes (`npx biome check`)
