---
id: 015-foundation-fixes
unit: 001-foundation-quality
intent: 003-ux-improvements
type: simple-construction-bolt
status: complete
stories:
  - 001-date-formatting
  - 002-centralize-type-colors
  - 003-filter-dropdown-fix
  - 004-sidebar-active-state
created: 2026-03-03T17:00:00Z
started: 2026-03-03T18:00:00Z
completed: 2026-03-03T18:30:00Z
current_stage: complete
stages_completed: [plan, implement, test]

requires_bolts: []
enables_bolts:
  - 016-inline-crud-pagination
  - 017-account-detail-filtering
  - 018-form-feedback
requires_units: []
blocks: false

complexity:
  avg_complexity: 1
  avg_uncertainty: 1
  max_dependencies: 0
  testing_scope: 1
---

# Bolt: 015-foundation-fixes

## Overview

Foundation bolt covering quick, high-impact fixes: shared date formatting, centralized type colors, filter dropdown behavior, and sidebar navigation. These unblock all subsequent bolts.

## Objective

Establish shared utilities and fix existing UI bugs that affect the entire application.

## Stories Included

- **001-date-formatting**: Add shared formatDate utility (Must)
- **002-centralize-type-colors**: Extract TYPE_COLORS to shared module (Must)
- **003-filter-dropdown-fix**: Fix click-outside and Escape on filter dropdown (Must)
- **004-sidebar-active-state**: Fix sidebar active state for nested routes (Must)

## Bolt Type

**Type**: Simple Construction Bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/simple-construction-bolt.md`

## Stages

- [x] **1. Plan**: Done → implementation-plan.md
- [x] **2. Implement**: Done → Source code + implementation-walkthrough.md
- [x] **3. Test**: Done → 37 structural tests passing

## Dependencies

### Requires
- None (foundation bolt)

### Enables
- 016-inline-crud-pagination
- 017-account-detail-filtering
- 018-form-feedback

## Success Criteria

- [x] formatDate utility used across all pages
- [x] TYPE_COLORS defined once in src/lib/constants.ts
- [x] Filter dropdown closes on outside click and Escape
- [x] Sidebar highlights correctly for nested routes
- [x] Biome lint passes
- [x] TypeScript compiles

## Notes

- formatDate should use Intl.DateTimeFormat for locale-aware formatting
- TYPE_COLORS needs both solid and gradient variants
- Click-outside handler should use useEffect with document event listener
- Sidebar active state: use startsWith but special-case "/" to avoid matching everything
