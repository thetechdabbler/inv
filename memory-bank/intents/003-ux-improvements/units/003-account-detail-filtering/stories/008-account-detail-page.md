---
id: 008-account-detail-page
unit: 003-account-detail-filtering
intent: 003-ux-improvements
status: complete
priority: Must
complexity: 3
created: 2026-03-03T17:00:00.000Z
implemented: true
---

# Story: Create account detail page with tabs

## User Story
**As a** user viewing my accounts
**I want** to see a dedicated detail page for each account
**So that** I can review its transactions, valuations, and history without editing

## Scope
Create /accounts/[id]/page.tsx with tabs: Overview (key stats, P&L), Transactions (filtered to account), Valuations (filtered), History (line chart). Update account listing cards to link here instead of /edit. Add "Edit" button on detail page.

## Acceptance Criteria
- [ ] /accounts/{id} shows account name, type, current value, invested, P&L
- [ ] Tabs: Overview, Transactions, Valuations, History
- [ ] Transactions tab shows only this account's transactions
- [ ] Valuations tab shows only this account's valuations
- [ ] History tab shows value-over-time chart
- [ ] "Edit" button links to /accounts/{id}/edit
- [ ] Account cards on listing page link to /accounts/{id}
