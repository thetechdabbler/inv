---
id: 003-filter-dropdown-fix
unit: 001-foundation-quality
intent: 003-ux-improvements
status: planned
priority: Must
complexity: 1
created: 2026-03-03T17:00:00Z
---

# Story: Fix filter dropdown click-outside and Escape

## User Story
**As a** user using the account filter dropdown
**I want** the dropdown to close when I click outside or press Escape
**So that** I don't have to click the trigger button again to dismiss it

## Scope
Add click-outside listener and Escape key handler to AccountDateFilter dropdown.

## Acceptance Criteria
- [ ] Clicking outside the dropdown closes it
- [ ] Pressing Escape closes the dropdown
- [ ] Clicking the trigger still toggles open/close
- [ ] Listeners cleaned up on unmount
