---
stage: implement
bolt: 017-account-detail-filtering
created: 2026-03-03T21:00:00Z
---

## Implementation Walkthrough: Account Detail & Filtering

### Summary

A dedicated account detail page was added at `/accounts/[id]` with Overview, Transactions, Valuations, and History tabs. Account listing and dashboard cards link to this detail page. The existing AccountDateFilter component is used on the transactions and valuations listing pages with filter state persisted in URL search params (accountIds, from, to).

### Structure Overview

Account detail lives under the app router as a dynamic segment. Transactions and valuations pages already had the filter component and URL-based filtering logic; the detail page reuses account API, performance API, and history API with inline transaction/valuation editing and a Recharts line chart for history.

### Completed Work

- [x] `src/app/accounts/[id]/page.tsx` - Account detail page with tabs (Overview, Transactions, Valuations, History), back link, Edit button to `/accounts/[id]/edit`
- [x] `src/app/accounts/page.tsx` - Account tiles link to `/accounts/{id}` (detail) instead of edit
- [x] `src/app/dashboard/page.tsx` - TopAccountCard links to `/accounts/{account.id}`
- [x] `src/app/transactions/page.tsx` - Renders AccountDateFilter and filters list by accountIds, from, to from URL
- [x] `src/app/valuations/page.tsx` - Renders AccountDateFilter and filters list by accountIds, from, to from URL
- [x] `src/components/filters/AccountDateFilter.tsx` - Existing component; reads/writes accountIds, from, to via searchParams

### Key Decisions

- **Client-side filtering on transactions/valuations**: Data is fetched per account (history API) and filtered in the client by URL params to avoid new API contracts and to keep shareable URLs.
- **Edit as separate route**: Detail page is read-only with an "Edit" button linking to `/accounts/[id]/edit` for consistency with existing edit flow.

### Deviations from Plan

None. All deliverables from the plan are implemented.

### Dependencies Added

None. Uses existing dependencies (Next.js, SWR, Recharts, shadcn/ui).

### Developer Notes

- Account detail page uses `/api/v1/accounts/{id}`, `/api/v1/accounts/{id}/performance`, and `/api/v1/accounts/{id}/history`. History tab reuses the same history entries as Transactions/Valuations tabs.
- TYPE_COLORS from `@/lib/constants` is used for account type styling on the detail header.
