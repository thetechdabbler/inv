---
id: 009-transactions-filtering
unit: 003-account-detail-filtering
intent: 003-ux-improvements
status: complete
priority: Must
complexity: 1
created: 2026-03-03T17:00:00.000Z
implemented: true
---

# Story: Add AccountDateFilter to transactions page

## User Story
**As a** user browsing transactions
**I want** to filter by specific accounts and date range
**So that** I can find the transactions I'm looking for

## Scope
Add the existing AccountDateFilter component to the transactions listing page. Wire filter state from URL params into the transaction fetching/display logic.

## Acceptance Criteria
- [ ] AccountDateFilter rendered above transaction list
- [ ] Selecting accounts filters transactions to those accounts
- [ ] Date range filters transactions by date
- [ ] Filter state persisted in URL params
- [ ] "Clear filters" resets to all transactions
