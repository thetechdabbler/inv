---
unit: 002-page-redesign
intent: 002-ui-modernization
phase: inception
status: ready
created: 2026-03-03T12:00:00Z
updated: 2026-03-03T12:00:00Z
---

# Unit Brief: Page Redesign

## Purpose

Redesign all application pages using shadcn/ui components and the new theme system. Each page gets consistent card layouts, form controls, tables, badges, and tab components — styled for both light and dark modes with a minimal futuristic aesthetic.

## Scope

### In Scope

- Dashboard page redesign (stat cards, allocation, top accounts)
- Accounts page redesign (account tiles, P&L display)
- Transactions listing and add-form pages
- Valuations listing and add-form pages
- Charts page (chart containers, filters)
- AI Insights chat page
- Import/Export data page

### Out of Scope

- Design system setup (001-design-system)
- Animations and transitions (003-animations-polish)
- Backend or API changes
- Mobile-specific layouts

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-4 | Dashboard Redesign | Must |
| FR-5 | Accounts Page Redesign | Must |
| FR-6 | Transactions & Valuations Pages Redesign | Must |
| FR-7 | Charts Page Redesign | Must |
| FR-8 | AI Insights Page Redesign | Should |
| FR-9 | Import/Export Page Redesign | Should |

---

## Domain Concepts

### Key Entities

| Entity | Description | Attributes |
|--------|-------------|------------|
| PageLayout | Consistent page structure | header, content area, loading/empty states |
| StatCard | Dashboard metric display | label, value, accent, trend indicator |
| AccountTile | Account card in grid | name, type, value, P&L, badge |
| MonthGroup | Grouped transaction/valuation list | month label, items, summary footer |

### Key Operations

| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| renderPage | Display page with shadcn components | data, theme | Themed JSX |
| renderEmptyState | Show placeholder when no data | message | Illustrated empty state |
| renderSkeleton | Show loading placeholders | count | Animated skeletons |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 7 |
| Must Have | 5 |
| Should Have | 2 |
| Could Have | 0 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 005-dashboard-redesign | Redesign dashboard page | Must | Planned |
| 006-accounts-redesign | Redesign accounts page | Must | Planned |
| 007-transactions-redesign | Redesign transactions pages | Must | Planned |
| 008-valuations-redesign | Redesign valuations pages | Must | Planned |
| 009-charts-redesign | Redesign charts page | Must | Planned |
| 010-insights-redesign | Redesign AI insights page | Should | Planned |
| 011-data-page-redesign | Redesign import/export page | Should | Planned |

---

## Dependencies

### Depends On

| Unit | Reason |
|------|--------|
| 001-design-system | Needs shadcn components, theme system, and sidebar redesign |

### Depended By

| Unit | Reason |
|------|--------|
| 003-animations-polish | Needs redesigned pages to add animations to |

### External Dependencies

| System | Purpose | Risk |
|--------|---------|------|
| None | All dependencies internal | — |

---

## Technical Context

### Suggested Technology

- shadcn/ui Card, Button, Input, Select, Badge, Table, Tabs, Alert, Skeleton, Tooltip
- Recharts (existing) for chart rendering
- react-markdown (existing) for insights
- Tailwind CSS with theme-aware classes

### Integration Points

| Integration | Type | Protocol |
|-------------|------|----------|
| shadcn/ui components | Import | React components |
| Existing API hooks (useSWR) | Data | Unchanged |
| Existing data formatting (formatInr, formatIndian) | Utility | Unchanged |

### Data Storage

| Data | Type | Volume | Retention |
|------|------|--------|-----------|
| None | — | — | — |

---

## Constraints

- Must not change any API calls or data logic
- Recharts components may need wrapper styling for dark mode compatibility
- Each page must look correct in both light and dark themes

---

## Success Criteria

### Functional

- All 7 page groups redesigned with consistent shadcn styling
- Both light and dark themes render correctly on every page
- All existing functionality preserved (forms submit, data displays, navigation works)

### Non-Functional

- WCAG 2.1 AA contrast on all pages in both themes
- No layout regressions

### Quality

- Biome lint passes
- TypeScript compiles with no errors
- Visual consistency across all pages

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| 012-page-redesign | simple-construction-bolt | 005-008 | Core pages (dashboard, accounts, transactions, valuations) |
| 013-page-redesign | simple-construction-bolt | 009-011 | Secondary pages (charts, insights, data) |

---

## Notes

- Split into 2 bolts to keep each manageable — core financial pages first, then secondary pages
- Recharts may need custom theme-aware colors (use CSS variables for chart fills/strokes)
- The insights chat page has a unique layout — may need special handling for message bubbles
