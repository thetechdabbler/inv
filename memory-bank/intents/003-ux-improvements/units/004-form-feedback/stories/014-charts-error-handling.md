---
id: 014-charts-error-handling
unit: 004-form-feedback
intent: 003-ux-improvements
status: complete
priority: Should
complexity: 1
created: 2026-03-03T17:00:00.000Z
implemented: true
---

# Story: Add error state to charts page

## User Story
**As a** user viewing charts when the API is down
**I want** to see an error message with a retry option
**So that** I'm not stuck on an endless loading skeleton

## Scope
Add error handling to the charts page, following the same pattern used on dashboard and accounts pages (error card with retry button).

## Acceptance Criteria
- [ ] Failed SWR calls show error card
- [ ] Error card has a "Retry" button
- [ ] Loading skeleton doesn't persist forever on error
- [ ] Pattern matches dashboard/accounts error states
