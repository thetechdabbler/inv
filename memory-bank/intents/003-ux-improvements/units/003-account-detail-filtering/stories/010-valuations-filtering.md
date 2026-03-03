---
id: 010-valuations-filtering
unit: 003-account-detail-filtering
intent: 003-ux-improvements
status: complete
priority: Must
complexity: 1
created: 2026-03-03T17:00:00.000Z
implemented: true
---

# Story: Add AccountDateFilter to valuations page

## User Story
**As a** user browsing valuations
**I want** to filter by specific accounts and date range
**So that** I can find the valuations I'm looking for

## Scope
Add AccountDateFilter component to the valuations listing page, same integration as transactions filtering.

## Acceptance Criteria
- [ ] AccountDateFilter rendered above valuation list
- [ ] Selecting accounts filters valuations to those accounts
- [ ] Date range filters valuations by date
- [ ] Filter state persisted in URL params
- [ ] "Clear filters" resets to all valuations
