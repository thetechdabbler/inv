---
id: 013-themed-confirmation-dialog
unit: 004-form-feedback
intent: 003-ux-improvements
status: complete
priority: Should
complexity: 1
created: 2026-03-03T17:00:00.000Z
implemented: true
---

# Story: Replace window.confirm with shadcn Dialog

## User Story
**As a** user importing data
**I want** the confirmation to match the app's design
**So that** the experience feels consistent and not jarring

## Scope
Replace window.confirm() in the data import flow with a shadcn Dialog component. Include warning icon, destructive action styling, Cancel and Confirm buttons.

## Acceptance Criteria
- [ ] Import triggers shadcn Dialog (not browser native confirm)
- [ ] Dialog shows warning message about data replacement
- [ ] Cancel button dismisses dialog
- [ ] Confirm button proceeds with import
- [ ] Dialog renders correctly in both themes
