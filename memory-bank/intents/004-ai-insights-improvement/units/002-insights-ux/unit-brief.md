---
unit: 002-insights-ux
intent: 004-ai-insights-improvement
unit_type: frontend
default_bolt_type: simple-construction-bolt
phase: inception
status: in-progress
created: 2026-03-03T10:45:00.000Z
updated: 2026-03-03T10:45:00.000Z
---

# Unit Brief: AI Insights UX

## Purpose

Improve the AI Insights user experience so that users can easily browse past insights, understand the underlying data and assumptions, and act on recommendations (e.g., adjust horizons, open relevant accounts, or view related charts).

## Scope

### In Scope
- Enhancements to the AI Insights page (layout, grouping, filters).
- Insight cards that show both narrative and key numeric/contextual summaries.
- History view with filters by type, account, and date.
- Quick actions linking to projections, accounts, and charts.

### Out of Scope
- Core LLM behavior (prompts, templates, parsing) — handled by `001-llm-insights-core`.
- Non-AI UI pages (dashboard, basic charts, standard CRUD screens).

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| AFR-5 | Insight UX Enhancements | Should |

---

## Domain Concepts

### Key Entities
| Entity | Description | Attributes |
|--------|-------------|------------|
| InsightCard | UI representation of a single insight | id, type, title, summary, createdAt, actions |
| InsightFilterState | Current filters for insights list | accountId, type, from, to |
| InsightHistoryGroup | Grouped insights by type/date | groupLabel, insights[] |

### Key Operations
| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| renderInsightList | Render insights with grouping | insights, filters | UI list |
| renderInsightDetail | Show full narrative + data | insight id | detail view |
| applyInsightFilters | Update filters and refetch | filter state | filtered insights |
| triggerQuickAction | Navigate based on insight | action, context | navigation / API call |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 3 |
| Must Have | 0 |
| Should Have | 3 |
| Could Have | 0 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 005-insights-history-list | Grouped insights history with filters | Should | Planned |
| 006-insight-cards-actions | Rich insight cards with quick actions | Should | Planned |
| 007-insight-detail-view | Detail view with narrative + data | Should | Planned |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 003-llm-insights | Existing insights API and audit data |
| 001-llm-insights-core | Enhanced structures and metrics |
| 005-investment-tracker-ui | Shared layout, components, and navigation |

### Depended By
| Unit | Reason |
|------|--------|
| None | Leaf UI unit for insights |

---

## Technical Context

### Suggested Technology
- React components within existing Next.js app router.
- shadcn/ui components and existing layout shell.
- SWR or React Query for insights and history data.

### Integration Points
| Integration | Type | Protocol |
|-------------|------|----------|
| insights APIs | API consumer | REST (Next.js API routes) |
| navigation | UI routing | Next.js links/router |

---

## Success Criteria

- [ ] Insights page shows grouped history with filters.
- [ ] Cards clearly separate narrative text from key numbers/assumptions.
- [ ] Quick actions navigate to relevant projections/charts or re-run queries.
- [ ] UX feels consistent with the rest of the application.

