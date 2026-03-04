---
id: 006-insight-cards-actions
unit: 002-insights-ux
intent: 004-ai-insights-improvement
status: draft
priority: should
created: 2026-03-04T00:00:00Z
assigned_bolt: 024-insights-ux
implemented: false
---

# Story: 006-insight-cards-actions

## User Story

**As an** investor
**I want** each insight card to clearly show both the LLM narrative and the key data it was based on, plus offer one-click actions
**So that** I can understand why the AI said what it said and act on it immediately

## Acceptance Criteria

- [ ] **Given** an insight card is rendered, **When** I view it, **Then** the card visually separates: a "Data" section (key numbers/assumptions from the snapshot) and a "Narrative" section (LLM text), using distinct background or border treatment
- [ ] **Given** a projection-type insight card, **When** rendered, **Then** a quick action "View projection chart" is shown and clicking it navigates to `/projections` with the relevant scope pre-selected
- [ ] **Given** an account-specific insight card, **When** rendered, **Then** a quick action "Open account" is shown and clicking it navigates to `/accounts/{id}`
- [ ] **Given** any insight card, **When** rendered, **Then** a "Re-run" quick action allows regenerating the same insight type (with same params) without re-entering any configuration
- [ ] **Given** the disclaimer text exists on the insight, **When** the card renders, **Then** the disclaimer is shown in a subdued style below the narrative, not inline with it

## Technical Notes

- `InsightCard` component: `src/components/insights/InsightCard.tsx`
- Props: `{ insight: InsightRecord, onRerun: () => void }`
- `InsightRecord` should include: `type`, `llmNarrative`, `assumptions`, `deterministicData?`, `templateVersion`, `createdAt`, `auditId`, `disclaimer`
- Quick actions are determined by insight type:
  - `future-projections` / `projection-quality-review` → "View projection chart"
  - `portfolio-summary` / `risk-analysis` → "View dashboard"
  - `rebalancing` → "Open accounts"
  - `natural-language-query` → No chart action
- Use `shadcn/ui` `Card` with explicit `CardHeader`, `CardContent` sections

## Dependencies

### Requires
- 005-insights-history-list (cards appear within the history list)
- 001-snapshot-builder (snapshot data fields shown in "Data" section)

### Enables
- 007-insight-detail-view (card click opens detail view)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| `deterministicData` is null | "Data" section shows "No projection data available" |
| `assumptions` array is empty | Assumptions row hidden; no blank space |
| Re-run fails (LLM error) | Toast shown with error; previous card remains visible |
| Insight type is unknown | Generic card shown without quick actions |

## Out of Scope

- Editing insight content (AI outputs are read-only)
- Sharing an insight card externally (future)
- Starring / bookmarking insights (future)
