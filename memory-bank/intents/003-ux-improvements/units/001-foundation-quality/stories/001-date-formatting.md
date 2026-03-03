---
id: 001-date-formatting
unit: 001-foundation-quality
intent: 003-ux-improvements
status: planned
priority: Must
complexity: 1
created: 2026-03-03T17:00:00Z
---

# Story: Add shared formatDate utility

## User Story
**As a** user viewing dates throughout the app
**I want** dates displayed in a friendly format like "15 Jan 2024"
**So that** I don't have to mentally parse raw ISO date strings

## Scope
Create a shared `formatDate` utility in `src/lib/format.ts`. Replace all raw ISO date displays across transactions, valuations, and other pages.

## Acceptance Criteria
- [ ] `formatDate` utility created using Intl.DateTimeFormat
- [ ] All visible dates use formatDate (no raw ISO strings)
- [ ] Handles null/undefined gracefully (returns empty string)
- [ ] Works in both light and dark modes (no styling changes needed)
