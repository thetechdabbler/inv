---
id: 019-polish-accessibility
unit: 005-polish-accessibility
intent: 003-ux-improvements
type: simple-construction-bolt
status: complete
stories:
  - 016-search-sort-accounts
  - 017-chat-improvements
  - 018-staleness-indicators
  - 019-keyboard-dragdrop-autobackup
  - 020-logout-drawer-fixes
created: 2026-03-03T17:00:00.000Z
started: 2026-03-03T18:00:00.000Z
completed: "2026-03-03T07:30:02Z"
current_stage: null
stages_completed:
  - name: plan
    completed: 2026-03-03T18:05:00.000Z
    artifact: implementation-plan.md
  - name: implement
    completed: 2026-03-03T18:20:00.000Z
    artifact: implementation-walkthrough.md
requires_bolts:
  - 016-inline-crud-pagination
  - 017-account-detail-filtering
  - 018-form-feedback
enables_bolts: []
requires_units: []
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 3
  testing_scope: 1
---

# Bolt: 019-polish-accessibility

## Overview

Final bolt covering nice-to-have polish and accessibility — search/sort on accounts, chat UX, staleness indicators, keyboard a11y, and drawer/logout fixes.

## Objective

Complete the UX improvement intent with quality-of-life enhancements and accessibility compliance.

## Stories Included

- **016-search-sort-accounts**: Search and sort on accounts page (Could)
- **017-chat-improvements**: Chat clear, copy, aria-live (Could)
- **018-staleness-indicators**: Stale valuation warnings (Could)
- **019-keyboard-dragdrop-autobackup**: Keyboard a11y + auto-backup (Could)
- **020-logout-drawer-fixes**: Logout confirmation + drawer a11y (Could)

## Bolt Type

**Type**: Simple Construction Bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/simple-construction-bolt.md`

## Stages

- [ ] **1. Plan**: Pending → implementation-plan.md
- [ ] **2. Implement**: Pending → Source code + implementation-walkthrough.md
- [ ] **3. Test**: Pending → test-walkthrough.md

## Dependencies

### Requires
- 016-inline-crud-pagination (CRUD complete)
- 017-account-detail-filtering (account detail enables staleness context)
- 018-form-feedback (form improvements done)

### Enables
- None (final bolt)

## Success Criteria

- [ ] Accounts page has search and sort controls
- [ ] Chat has clear history, copy-to-clipboard, aria-live
- [ ] Stale accounts show warning badge
- [ ] File dropzone is keyboard-accessible
- [ ] Auto-backup offered before import
- [ ] Logout shows confirmation dialog
- [ ] Mobile drawer has focus trap, Escape key, proper ARIA
- [ ] Biome lint passes
- [ ] TypeScript compiles

## Notes

- All "Could" priority — can be selectively skipped if time-constrained
- Focus trap can use lightweight custom hook instead of a dependency
- Staleness computed client-side from existing data
