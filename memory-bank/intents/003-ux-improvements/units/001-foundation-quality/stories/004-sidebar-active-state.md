---
id: 004-sidebar-active-state
unit: 001-foundation-quality
intent: 003-ux-improvements
status: planned
priority: Must
complexity: 1
created: 2026-03-03T17:00:00Z
---

# Story: Fix sidebar active state for nested routes

## User Story
**As a** user on a nested route like /accounts/123/edit
**I want** the "Accounts" sidebar item to be highlighted
**So that** I know where I am in the navigation

## Scope
Change Layout sidebar active matching from exact `pathname === href` to `pathname.startsWith(href)` (with special handling for "/" root).

## Acceptance Criteria
- [ ] /accounts/123/edit highlights "Accounts"
- [ ] /transactions/add highlights "Transactions"
- [ ] /valuations/add highlights "Valuations"
- [ ] Dashboard "/" only matches exact path (not all routes)
