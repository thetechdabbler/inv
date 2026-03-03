---
id: 016-inline-crud-pagination
unit: 002-crud-pagination
intent: 003-ux-improvements
type: simple-construction-bolt
status: complete
stories:
  - 005-inline-edit-delete-transactions
  - 006-inline-edit-delete-valuations
  - 007-pagination
created: 2026-03-03T17:00:00Z
started: 2026-03-03T19:00:00Z
completed: 2026-03-03T19:30:00Z
current_stage: complete
stages_completed: [plan, implement, test]

requires_bolts:
  - 015-foundation-fixes
enables_bolts:
  - 019-polish-accessibility
requires_units: []
blocks: false

complexity:
  avg_complexity: 2
  avg_uncertainty: 2
  max_dependencies: 1
  testing_scope: 2
---

# Bolt: 016-inline-crud-pagination

## Overview

Add inline edit and delete for transactions and valuations, plus paginated data loading with "Load more" across data-heavy pages.

## Objective

Enable users to correct data entry mistakes and handle large datasets gracefully.

## Stories Included

- **005-inline-edit-delete-transactions**: Inline CRUD for transactions (Must)
- **006-inline-edit-delete-valuations**: Inline CRUD for valuations (Must)
- **007-pagination**: Paginated loading with Load More (Must)

## Bolt Type

**Type**: Simple Construction Bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/simple-construction-bolt.md`

## Stages

- [x] **1. Plan**: Done → implementation-plan.md
- [x] **2. Implement**: Done → Source code + implementation-walkthrough.md
- [x] **3. Test**: Done → 35 structural tests passing

## Dependencies

### Requires
- 015-foundation-fixes (formatDate, centralized colors)

### Enables
- 019-polish-accessibility

## Success Criteria

- [x] Transactions editable inline with save/cancel
- [x] Transactions deletable with confirmation
- [x] Valuations editable inline with save/cancel
- [x] Valuations deletable with confirmation
- [x] Pages load 50 items initially with "Load more"
- [x] Total count displayed
- [x] API routes for PATCH/DELETE exist
- [x] Biome lint passes
- [x] TypeScript compiles

## Notes

- Check existing API routes first — may need to add PATCH/DELETE endpoints
- Inline edit must not cause layout shift
- Pagination must work with existing monthly grouping logic
- Use SWR mutate for optimistic updates
