---
id: 007-insight-detail-view
unit: 002-insights-ux
intent: 004-ai-insights-improvement
status: draft
priority: should
created: 2026-03-04T00:00:00Z
assigned_bolt: 024-insights-ux
implemented: false
---

# Story: 007-insight-detail-view

## User Story

**As an** investor
**I want** to open a full detail view for any past insight
**So that** I can read the complete narrative, see the underlying data snapshot, and understand the model and template that produced it

## Acceptance Criteria

- [ ] **Given** I click an insight entry in the history list, **When** the detail view opens, **Then** it shows: full LLM narrative (markdown-rendered), the snapshot data summary used, template name + version, model used, token usage, and timestamp
- [ ] **Given** a projection-type insight, **When** the detail view opens, **Then** a `ProjectionVsActualChart` is embedded showing the deterministic data from the insight record
- [ ] **Given** the detail view is open, **When** I click "Back", **Then** I return to the history list with filters preserved
- [ ] **Given** the detail view is accessed via a shareable URL (e.g., `/insights/{auditId}`), **When** the page loads, **Then** the correct insight is loaded and displayed without requiring a prior list navigation
- [ ] **Given** the audit record does not exist (wrong id), **When** the detail view loads, **Then** a 404-style error page is shown with a link back to the insights list

## Technical Notes

- Route: `src/app/insights/[auditId]/page.tsx` — new page under existing `/insights` section
- Fetch from `GET /api/v1/insights/audit/:auditId`
- Markdown rendering: use existing `react-markdown` or similar (check current deps)
- `ProjectionVsActualChart` already exists at `src/components/charts/ProjectionVsActualChart.tsx` — embed it when `deterministicData` is present
- Token usage display: `{promptTokens} prompt / {completionTokens} completion` in a metadata row
- Back navigation: preserve URL params from previous history list URL using `router.back()` or explicit link

## Dependencies

### Requires
- 005-insights-history-list (entry point to this view)
- 006-insight-cards-actions (quick actions available in detail view too)

### Enables
- None (leaf view)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| `deterministicData` missing from record | Chart section hidden; no empty container shown |
| Token usage fields are null | Token row hidden |
| Narrative contains broken markdown | Render best-effort; do not crash |
| auditId is invalid format | 400 returned from API; "Invalid insight ID" shown |

## Out of Scope

- Editing or annotating the detail view (AI outputs are read-only)
- Comparing two insight details side-by-side (future)
- Printing or PDF export (future)
