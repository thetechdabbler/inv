---
id: 024-insights-ux
unit: 002-insights-ux
intent: 004-ai-insights-improvement
type: simple-construction-bolt
status: planned
stories:
  - 005-insights-history-list
  - 006-insight-cards-actions
  - 007-insight-detail-view
created: 2026-03-04T00:00:00Z
started: null
completed: null
current_stage: null
stages_completed: []
requires_bolts:
  - 023-llm-insights-core
enables_bolts: []
requires_units:
  - 003-llm-insights
  - 001-llm-insights-core
  - 005-investment-tracker-ui
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 3
  testing_scope: 1
---

# Bolt: 024-insights-ux

## Overview

Frontend bolt that delivers the complete AI Insights UX improvement: grouped history with filters, rich insight cards with quick actions, and a full-detail view with embedded projection chart.

## Objective

Build three complementary UI components/pages that surface the richer insight data from the core backend — history list with grouping and filters, insight cards that separate data from narrative with one-click actions, and a detail page accessible by direct URL.

## Stories Included

- **005-insights-history-list**: Grouped insights history with filters (Should)
- **006-insight-cards-actions**: Rich insight cards with quick actions (Should)
- **007-insight-detail-view**: Detail view with narrative + data (Should)

## Bolt Type

**Type**: Simple Construction Bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/simple-construction-bolt.md`

## Stages

- [ ] **1. Plan**: Pending → implementation-plan.md
- [ ] **2. Implement**: Pending → Source code + implementation-walkthrough.md
- [ ] **3. Test**: Pending → test-walkthrough.md

## Dependencies

### Requires
- 023-llm-insights-core (enriched audit API + `HybridProjectionResult` + disclaimer fields)

### Enables
- None (final bolt for this intent)

### Unit Dependencies
- 003-llm-insights (existing insights API and audit trail)
- 001-llm-insights-core (enriched structures from this intent)
- 005-investment-tracker-ui (shared layout, shadcn components, navigation shell)

## Success Criteria

- [ ] History panel groups insights by type with count badges and "Load more"
- [ ] Filters (account, type, date range) update URL params and re-fetch
- [ ] `InsightCard` visually separates "Data" and "Narrative" sections
- [ ] Quick actions: "View projection chart", "Open account", "Re-run" present per type
- [ ] Detail page at `/insights/[auditId]` works as standalone URL
- [ ] `ProjectionVsActualChart` embedded in detail view when `deterministicData` present
- [ ] Empty state shown when no insights exist
- [ ] TypeScript compiles, Biome lint passes

## Notes

- `ProjectionVsActualChart` already exists at `src/components/charts/ProjectionVsActualChart.tsx` — reuse it
- Back navigation from detail view must preserve history list filter state
- All three stories can be built in a single pass: list → card → detail (natural dependency order)
