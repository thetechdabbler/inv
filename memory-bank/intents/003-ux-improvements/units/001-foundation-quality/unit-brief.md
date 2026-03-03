---
unit: 001-foundation-quality
intent: 003-ux-improvements
phase: inception
status: ready
created: 2026-03-03T17:00:00Z
updated: 2026-03-03T17:00:00Z
---

# Unit Brief: Foundation & Quality

## Purpose

Quick foundational fixes that improve code quality and unblock other units — shared date formatting utility, centralized type colors, filter dropdown behavior fix, and sidebar navigation fix.

## Scope

### In Scope
- Shared formatDate utility for locale-friendly date display
- Centralized TYPE_COLORS constant replacing duplicated definitions
- AccountDateFilter click-outside-to-close and Escape key
- Layout sidebar active state using startsWith for nested routes

### Out of Scope
- New pages or major feature additions
- API changes
- Animation or theming changes (handled by 002-ui-modernization)

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-7 | Localized Date Formatting | Must |
| FR-8 | Centralize TYPE_COLORS | Must |
| FR-9 | Filter Dropdown Click-Outside Close | Must |
| FR-13 | Sidebar Active State for Nested Routes | Must |

---

## Domain Concepts

### Key Entities
| Entity | Description | Attributes |
|--------|-------------|------------|
| DateFormatter | Locale-aware date display | input ISO string, output formatted string |
| TypeColorMap | Account type → color mapping | type key, solid color, gradient color |

### Key Operations
| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| formatDate | Convert ISO date to locale string | ISO string | "15 Jan 2024" |
| getTypeColor | Get color for account type | type string | CSS class string |

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
| 001-date-formatting | Add shared formatDate utility | Must | Planned |
| 002-centralize-type-colors | Extract TYPE_COLORS to shared module | Must | Planned |
| 003-filter-dropdown-fix | Fix click-outside and Escape on filter dropdown | Must | Planned |
| 004-sidebar-active-state | Fix sidebar active state for nested routes | Must | Planned |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| None | Foundation unit |

### Depended By
| Unit | Reason |
|------|--------|
| 002-crud-pagination | Uses formatDate in CRUD rows |
| 003-account-detail-filtering | Uses fixed filter dropdown |
| 004-form-feedback | Uses centralized colors |

### External Dependencies
| System | Purpose | Risk |
|--------|---------|------|
| None | Pure frontend changes | — |

---

## Technical Context

### Suggested Technology
- Intl.DateTimeFormat for locale-aware formatting
- useEffect + document.addEventListener for click-outside
- pathname.startsWith() for active state matching

### Integration Points
| Integration | Type | Protocol |
|-------------|------|----------|
| All page components | React | Import shared constants/utilities |

### Data Storage
| Data | Type | Volume | Retention |
|------|------|--------|-----------|
| None | — | — | — |

---

## Constraints

- Must not break existing page functionality
- TYPE_COLORS must support both solid and gradient variants

---

## Success Criteria

### Functional
- [ ] All dates display in locale format (e.g., "15 Jan 2024")
- [ ] TYPE_COLORS defined once, imported everywhere
- [ ] Filter dropdown closes on outside click and Escape
- [ ] Sidebar highlights "Accounts" when on /accounts/123/edit

### Non-Functional
- [ ] No regressions in existing tests

### Quality
- [ ] Biome lint passes
- [ ] TypeScript compiles

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| 015-foundation-fixes | simple-construction-bolt | 001-004 | All foundation fixes in one bolt |

---

## Notes

- formatDate should handle null/undefined gracefully (return empty string)
- TYPE_COLORS should export both `TYPE_COLORS` (solid) and `TYPE_GRADIENTS` (gradient) maps
