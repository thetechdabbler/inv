---
id: 012-page-redesign
unit: 002-page-redesign
intent: 002-ui-modernization
type: simple-construction-bolt
status: complete
stories:
  - 005-dashboard-redesign
  - 006-accounts-redesign
  - 007-transactions-redesign
  - 008-valuations-redesign
created: 2026-03-03T12:00:00.000Z
started: 2026-03-03T14:00:00.000Z
completed: "2026-03-02T20:32:27Z"
current_stage: null
stages_completed:
  - name: plan
    completed: 2026-03-03T14:10:00.000Z
    artifact: implementation-plan.md
  - name: implement
    completed: 2026-03-03T14:40:00.000Z
    artifact: implementation-walkthrough.md
  - name: test
    completed: 2026-03-03T14:55:00.000Z
    artifact: test-walkthrough.md
requires_bolts:
  - 011-design-system
enables_bolts:
  - 013-page-redesign
requires_units: []
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 2
  testing_scope: 1
---

# Bolt: 012-page-redesign

## Overview

First page-redesign bolt covering the 4 core financial pages — dashboard, accounts, transactions, and valuations. Replaces all current styling with shadcn/ui components and the new theme system.

## Objective

Convert the dashboard, accounts, transactions (listing + add), and valuations (listing + add) pages to use shadcn/ui components with consistent styling in both light and dark modes.

## Stories Included

- **005-dashboard-redesign**: Redesign dashboard (Must)
- **006-accounts-redesign**: Redesign accounts page (Must)
- **007-transactions-redesign**: Redesign transactions pages (Must)
- **008-valuations-redesign**: Redesign valuations pages (Must)

## Bolt Type

**Type**: Simple Construction Bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/simple-construction-bolt.md`

## Stages

- [ ] **1. Plan**: Pending → implementation-plan.md
- [ ] **2. Implement**: Pending → Source code + implementation-walkthrough.md
- [ ] **3. Test**: Pending → test-walkthrough.md

## Dependencies

### Requires
- 011-design-system (shadcn components and theme system)

### Enables
- 013-page-redesign (secondary pages)

## Success Criteria

- [ ] Dashboard redesigned with shadcn Card, Badge, Skeleton
- [ ] Accounts page uses shadcn Card tiles with themed P&L
- [ ] Transactions listing and add pages use shadcn components
- [ ] Valuations listing and add pages use shadcn components
- [ ] All 4 page groups render correctly in light and dark modes
- [ ] Biome lint passes
- [ ] TypeScript compiles

## Notes

- These are the most data-heavy pages — ensure number formatting and color coding remain clear in both themes
- Transaction/valuation month grouping UI should use Card with consistent header/footer pattern
