---
id: 012-form-reset
unit: 004-form-feedback
intent: 003-ux-improvements
status: complete
priority: Should
complexity: 1
created: 2026-03-03T17:00:00.000Z
implemented: true
---

# Story: Reset all form fields after submission

## User Story
**As a** user adding multiple entries
**I want** the form to fully clear after successful submission
**So that** I don't accidentally re-submit the same amount

## Scope
Ensure amount/value fields reset alongside date and description on both add transaction and add valuation forms. Keep selected account for bulk entry workflow.

## Acceptance Criteria
- [ ] Amount field clears after successful transaction submission
- [ ] Value field clears after successful valuation submission
- [ ] Date and description also reset
- [ ] Selected account persists (not cleared)
