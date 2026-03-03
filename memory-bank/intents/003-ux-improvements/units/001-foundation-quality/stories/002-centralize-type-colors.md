---
id: 002-centralize-type-colors
unit: 001-foundation-quality
intent: 003-ux-improvements
status: planned
priority: Must
complexity: 1
created: 2026-03-03T17:00:00Z
---

# Story: Centralize TYPE_COLORS

## User Story
**As a** developer maintaining the codebase
**I want** account type colors defined in one place
**So that** color changes are consistent and don't require editing 5+ files

## Scope
Create `src/lib/constants.ts` with `TYPE_COLORS` (solid) and `TYPE_GRADIENTS` (gradient) maps. Update all pages to import from the shared module. Remove duplicated definitions.

## Acceptance Criteria
- [ ] Single TYPE_COLORS and TYPE_GRADIENTS in src/lib/constants.ts
- [ ] All pages import from shared module (dashboard, accounts, charts, etc.)
- [ ] No duplicate TYPE_COLORS definitions remain
- [ ] Colors render correctly in both themes
