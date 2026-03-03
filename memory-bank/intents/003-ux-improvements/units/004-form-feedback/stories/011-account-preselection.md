---
id: 011-account-preselection
unit: 004-form-feedback
intent: 003-ux-improvements
status: complete
priority: Should
complexity: 1
created: 2026-03-03T17:00:00.000Z
implemented: true
---

# Story: Pre-select account from URL param

## User Story
**As a** user navigating from an account detail to "Add Transaction"
**I want** the account to be pre-selected
**So that** I don't have to manually pick it again

## Scope
Read `?accountId=xyz` from URL on /transactions/add and /valuations/add pages. Pre-select the matching account in the sidebar.

## Acceptance Criteria
- [ ] ?accountId param is read on mount
- [ ] Matching account is auto-selected in sidebar
- [ ] Works on both /transactions/add and /valuations/add
- [ ] No error if accountId doesn't match any account
