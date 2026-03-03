---
id: 020-logout-drawer-fixes
unit: 005-polish-accessibility
intent: 003-ux-improvements
status: complete
priority: Could
complexity: 2
created: 2026-03-03T17:00:00.000Z
implemented: true
---

# Story: Logout confirmation + mobile drawer a11y

## User Story
**As a** user
**I want** confirmation before logout and a properly accessible mobile menu
**So that** I don't accidentally log out and can navigate via keyboard

## Scope
Add shadcn Dialog confirmation before logout. Fix mobile drawer: add focus trap, Escape key to close, proper ARIA roles on backdrop overlay.

## Acceptance Criteria
- [ ] Logout click shows "Are you sure?" dialog
- [ ] Escape key closes mobile drawer
- [ ] Focus trapped inside open drawer
- [ ] Backdrop uses role="presentation" (not role="button")
- [ ] Tab navigation works correctly within drawer
