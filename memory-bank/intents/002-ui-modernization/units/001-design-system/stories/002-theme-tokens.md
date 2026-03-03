---
id: 002-theme-tokens
unit: 001-design-system
intent: 002-ui-modernization
status: complete
priority: Must
complexity: 2
created: 2026-03-03T12:00:00.000Z
implemented: true
---

# Story: 002-theme-tokens

## User Story

**As a** user
**I want** consistent light and dark theme palettes defined via CSS variables
**So that** the app has a polished, accessible look in both modes

## Scope

Define CSS variables for light and dark palettes in `globals.css`. Light: white/slate + indigo accents. Dark: slate-900/950 + cyan/violet neon accents with soft glow.

## Acceptance Criteria

- [ ] CSS variables defined in `:root` and `.dark`
- [ ] Light palette has proper contrast (AA)
- [ ] Dark palette has soft glow borders
- [ ] All shadcn components inherit theme colors
- [ ] `globals.css` uses `@layer base`
