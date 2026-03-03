---
stage: plan
bolt: 017-account-detail-filtering
created: 2026-03-03T20:00:00Z
---

## Implementation Plan: Account Detail & Filtering

### Objective

Create a dedicated read-only account detail page with tabs and add AccountDateFilter to transactions and valuations listing pages for consistent filtering.

### Deliverables

- `/accounts/[id]/page.tsx` with tabs: Overview, Transactions, Valuations, History
- Account listing cards and dashboard TopAccountCard link to `/accounts/{id}` (not edit)
- "Edit" button on detail page linking to `/accounts/{id}/edit`
- AccountDateFilter on transactions page with URL param persistence
- AccountDateFilter on valuations page with URL param persistence

### Dependencies

- 015-foundation-fixes: Fixed filter dropdown, formatDate, centralized colors (TYPE_COLORS)

### Technical Approach

- Next.js dynamic route for account detail; shadcn Tabs for sections
- Reuse AccountDateFilter (reads accountIds, from, to from URL; updates via router.push)
- Transactions/valuations pages: fetch all account histories, filter client-side by searchParams (accountIds, from, to)
- Reuse existing chart approach (Recharts) for History tab

### Acceptance Criteria

- [x] /accounts/{id} page with Overview, Transactions, Valuations, History tabs
- [x] Account listing cards link to /accounts/{id}
- [x] "Edit" button on detail page links to /accounts/{id}/edit
- [x] Transactions page has AccountDateFilter
- [x] Valuations page has AccountDateFilter
- [x] Filter state persisted in URL params
- [ ] Biome lint passes
- [ ] TypeScript compiles
