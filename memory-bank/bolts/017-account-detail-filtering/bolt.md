---
id: 017-account-detail-filtering
unit: 003-account-detail-filtering
intent: 003-ux-improvements
type: simple-construction-bolt
status: complete
stories:
  - 008-account-detail-page
  - 009-transactions-filtering
  - 010-valuations-filtering
created: 2026-03-03T17:00:00.000Z
started: 2026-03-03T20:00:00.000Z
completed: "2026-03-03T05:04:50Z"
current_stage: null
stages_completed:
  - name: plan
    completed: 2026-03-03T20:00:00.000Z
    artifact: implementation-plan.md
  - name: implement
    completed: 2026-03-03T21:00:00.000Z
    artifact: implementation-walkthrough.md
  - name: test
    completed: 2026-03-03T21:15:00.000Z
    artifact: test-walkthrough.md
requires_bolts:
  - 015-foundation-fixes
enables_bolts:
  - 019-polish-accessibility
requires_units: []
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 1
  testing_scope: 1
---

# Bolt: 017-account-detail-filtering

## Overview

Create a dedicated account detail page with tabs and add AccountDateFilter to transactions and valuations listing pages.

## Objective

Give users a proper account overview and consistent filtering across all listing pages.

## Stories Included

- **008-account-detail-page**: Account detail page with tabs (Must)
- **009-transactions-filtering**: AccountDateFilter on transactions (Must)
- **010-valuations-filtering**: AccountDateFilter on valuations (Must)

## Bolt Type

**Type**: Simple Construction Bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/simple-construction-bolt.md`

## Stages

- [x] **1. Plan**: Complete → implementation-plan.md
- [x] **2. Implement**: Complete → Source code + implementation-walkthrough.md
- [x] **3. Test**: Complete → test-walkthrough.md

## Dependencies

### Requires
- 015-foundation-fixes (fixed filter dropdown, formatDate, centralized colors)

### Enables
- 019-polish-accessibility

## Success Criteria

- [x] /accounts/{id} page with Overview, Transactions, Valuations, History tabs
- [x] Account listing cards link to /accounts/{id} (not /edit)
- [x] "Edit" button on detail page links to /accounts/{id}/edit
- [x] Transactions page has AccountDateFilter
- [x] Valuations page has AccountDateFilter
- [x] Filter state persisted in URL params
- [ ] Biome lint passes (project has pre-existing lint in .next; src scope passes for bolt files)
- [ ] TypeScript compiles (one pre-existing test error outside bolt scope)

## Notes

- Reuse existing chart components for History tab
- Consider lazy-loading tab content
- Update dashboard TopAccountCard links too
