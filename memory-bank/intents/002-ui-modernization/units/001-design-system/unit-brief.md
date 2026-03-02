---
unit: 001-design-system
intent: 002-ui-modernization
phase: inception
status: ready
created: 2026-03-03T12:00:00Z
updated: 2026-03-03T12:00:00Z
---

# Unit Brief: Design System

## Purpose

Establish the design foundation for the UI modernization — install shadcn/ui, configure CSS variable theming for light and dark modes, build the theme toggle, and redesign the sidebar/navigation with a minimal futuristic aesthetic.

## Scope

### In Scope

- shadcn/ui installation and Tailwind integration
- CSS variable theming with light and dark palettes
- Theme toggle component (light/dark/system) with localStorage persistence
- Sidebar redesign with Lucide icons, glow effects, and backdrop-blur
- Base shadcn component generation (Card, Button, Input, Select, Badge, Table, Tabs, Dialog, Tooltip, Alert, Skeleton)

### Out of Scope

- Individual page redesigns (002-page-redesign)
- Animations and transitions (003-animations-polish)
- Any backend or API changes

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Design System & Theme Infrastructure | Must |
| FR-2 | Theme Toggle & Persistence | Must |
| FR-3 | Sidebar & Navigation Redesign | Must |

---

## Domain Concepts

### Key Entities

| Entity | Description | Attributes |
|--------|-------------|------------|
| Theme | Color mode state | mode (light/dark/system), CSS variables |
| DesignToken | Shared styling constant | colors, spacing, radius, shadows |
| NavLink | Sidebar navigation item | href, label, icon, active state |

### Key Operations

| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| toggleTheme | Switch between light/dark/system | mode | Updated CSS class on html element |
| persistTheme | Save preference | mode | localStorage entry |
| resolveTheme | Determine effective theme | mode + system preference | "light" or "dark" |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 4 |
| Must Have | 4 |
| Should Have | 0 |
| Could Have | 0 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 001-shadcn-setup | Install and configure shadcn/ui | Must | Planned |
| 002-theme-tokens | Define light/dark theme CSS variables | Must | Planned |
| 003-theme-toggle | Build theme toggle with persistence | Must | Planned |
| 004-sidebar-redesign | Redesign sidebar and navigation | Must | Planned |

---

## Dependencies

### Depends On

| Unit | Reason |
|------|--------|
| None | Foundation unit — no dependencies |

### Depended By

| Unit | Reason |
|------|--------|
| 002-page-redesign | Needs shadcn components and theme system |
| 003-animations-polish | Needs themed components to animate |

### External Dependencies

| System | Purpose | Risk |
|--------|---------|------|
| shadcn/ui | Component primitives | Low — well-maintained, Next.js compatible |
| Radix UI | Underlying accessibility primitives | Low — peer dependency of shadcn |
| Lucide Icons | Icon set | Low — already used by shadcn |

---

## Technical Context

### Suggested Technology

- shadcn/ui CLI for component scaffolding
- next-themes for theme management (or custom implementation)
- Tailwind CSS with CSS variable mode
- Lucide React for icons

### Integration Points

| Integration | Type | Protocol |
|-------------|------|----------|
| Tailwind config | Build config | tailwind.config.ts |
| globals.css | CSS variables | @layer base |
| Layout.tsx | Component | React wrapper |

### Data Storage

| Data | Type | Volume | Retention |
|------|------|--------|-----------|
| Theme preference | localStorage | 1 key | Permanent |

---

## Constraints

- shadcn components are copied into `src/components/ui/`, not installed as npm package
- CSS variables must use HSL format per shadcn convention
- Theme toggle must prevent FOUC on page load
- Must not break existing functionality

---

## Success Criteria

### Functional

- shadcn/ui fully configured with all needed base components
- Light and dark themes render correctly with proper contrast
- Theme toggle switches modes instantly with no FOUC
- Sidebar has futuristic aesthetic with glow effects in dark mode

### Non-Functional

- Theme switch < 50ms latency
- WCAG 2.1 AA color contrast in both modes

### Quality

- Biome lint passes
- TypeScript compiles with no errors
- All acceptance criteria met

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| 011-design-system | simple-construction-bolt | 001-004 | Full design system setup |

---

## Notes

- Consider using next-themes package for robust theme management (handles FOUC, system preference, SSR)
- shadcn CLI: `npx shadcn@latest init` then `npx shadcn@latest add card button input select badge table tabs dialog tooltip alert skeleton`
- Lucide icons replace the inline SVG path strings currently in Layout.tsx
