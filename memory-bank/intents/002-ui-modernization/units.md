---
intent: 002-ui-modernization
phase: inception
status: units-decomposed
updated: 2026-03-03T12:00:00Z
---

# UI Modernization - Unit Decomposition

## Units Overview

This intent decomposes into 3 units of work:

### Unit 1: 001-design-system

**Description**: Foundation layer — install shadcn/ui, configure CSS variable theming for light/dark modes, create theme toggle, redesign sidebar/navigation.

**Stories**:

- 001-shadcn-setup: Install and configure shadcn/ui
- 002-theme-tokens: Define light and dark theme CSS variables
- 003-theme-toggle: Build theme toggle with persistence
- 004-sidebar-redesign: Redesign sidebar and navigation

**Deliverables**:

- shadcn/ui installed with Tailwind integration
- `src/components/ui/` with base shadcn components
- CSS variable theming (light + dark)
- Theme toggle component in sidebar
- Redesigned sidebar with Lucide icons and glow effects

**Dependencies**:

- Depends on: None (foundation unit)
- Depended by: 002-page-redesign, 003-animations-polish

**Estimated Complexity**: M

### Unit 2: 002-page-redesign

**Description**: Replace all page UIs with shadcn components and the new theme. Covers dashboard, accounts, transactions, valuations, charts, insights, and data pages.

**Stories**:

- 005-dashboard-redesign: Redesign dashboard page
- 006-accounts-redesign: Redesign accounts page
- 007-transactions-redesign: Redesign transactions pages
- 008-valuations-redesign: Redesign valuations pages
- 009-charts-redesign: Redesign charts page
- 010-insights-redesign: Redesign AI insights page
- 011-data-page-redesign: Redesign import/export page

**Deliverables**:

- All 7 page groups redesigned with shadcn components
- Consistent card, table, badge, button, input, tab styling
- Both light and dark modes verified per page

**Dependencies**:

- Depends on: 001-design-system
- Depended by: 003-animations-polish

**Estimated Complexity**: L

### Unit 3: 003-animations-polish

**Description**: Add page transitions, staggered entry animations, number count-up effects, hover micro-interactions, and final polish.

**Stories**:

- 012-page-transitions: Add page-level fade-in transitions
- 013-micro-interactions: Add hover, press, count-up, and stagger animations

**Deliverables**:

- Page transition system (CSS or lightweight JS)
- Staggered fade-in for card grids and lists
- Number count-up animation for stat values
- Button press and hover feedback effects
- prefers-reduced-motion support

**Dependencies**:

- Depends on: 002-page-redesign
- Depended by: None (final unit)

**Estimated Complexity**: M

## Unit Dependency Graph

```text
[001-design-system] ──> [002-page-redesign] ──> [003-animations-polish]
```

## Execution Order

1. 001-design-system (foundation — shadcn, theming, sidebar)
2. 002-page-redesign (all pages converted — 2 bolts)
3. 003-animations-polish (transitions and micro-interactions)
