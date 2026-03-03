---
id: 018-staleness-indicators
unit: 005-polish-accessibility
intent: 003-ux-improvements
status: complete
priority: Could
complexity: 1
created: 2026-03-03T17:00:00.000Z
implemented: true
---

# Story: Show stale valuation warnings

## User Story
**As a** user tracking investment values
**I want** to see which accounts haven't been valued recently
**So that** I know which accounts need updating

## Scope
Add a "stale" warning badge to accounts that haven't been valued in >30 days, visible on the valuations listing page and dashboard top accounts.

## Acceptance Criteria
- [ ] Accounts without a valuation in 30+ days show warning badge
- [ ] Badge visible on valuations page and dashboard
- [ ] Threshold is configurable (default 30 days)
- [ ] Badge styled consistently with existing Badge component
