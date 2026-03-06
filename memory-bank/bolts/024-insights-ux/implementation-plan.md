---
stage: plan
bolt: 024-insights-ux
created: 2026-03-04T20:10:00Z
---

# Implementation Plan — Insights UX

## Approach

Redesign the AI Insights page into two tabs (History | Chat), build a grouped history panel with type filters, an `InsightCard` component with Data/Narrative separation, and a detail page at `/insights/[auditId]`.

---

## Files to Create / Modify

### Backend (2 files)

**1 — `src/infrastructure/prisma/llm-query-repository.ts`** *(modified)*
- Add `type?`, `from?`, `to?` to `findAllLLMQueries` options
- Add Prisma `where` clause: `insightType` match + `createdAt` range

**2 — `src/app/api/v1/insights/history/route.ts`** *(modified)*
- Parse `?type=`, `?from=`, `?to=` query params
- Pass to `findAllLLMQueries`

### Frontend (4 files)

**3 — `src/components/insights/InsightCard.tsx`** *(new)*
- Props: `{ insight: LLMInteraction; onRerun?: () => void }`
- Sections:
  - Header: type badge + relative timestamp + "Open detail" link
  - Narrative: show first 200 chars, expand to full; rendered as plain text (disclaimer split off)
  - Disclaimer: subdued grey text at bottom, only when present
  - Quick actions toolbar: type-specific buttons + Re-run
- Insight type → label + quick action mapping

**4 — `src/components/insights/InsightHistoryPanel.tsx`** *(new)*
- Tabs: All | Summary | Projections | Risk | Rebalancing | Q&A | Projection Review
- Each tab shows count badge + its filtered list of `InsightCard`s
- Filters: date range (from/to inputs) — preserved in URL params
- Load more (pagination with offset)
- Empty state per tab

**5 — `src/app/insights/page.tsx`** *(modified)*
- Add outer `Tabs` with "History" | "Chat" tabs
- History tab: renders `InsightHistoryPanel`
- Chat tab: existing `InsightChat` component (unchanged)

**6 — `src/app/insights/[auditId]/page.tsx`** *(new)*
- Server component that fetches from `/api/v1/insights/debug/:auditId`
- 404 state when not found
- Sections: header (type + timestamp), full narrative (react-markdown), metadata row (model, tokens, duration, template), Back button
- For projection-type insights: "View current projections →" link to `/projections`

---

## Design Decisions

**Disclaimer separation**: Narrative from bolt 023 always ends with `\n\n⚠️ ...`. Split on `\n\n⚠️` to display narrative and disclaimer in separate styled sections.

**Projection chart in detail view**: `DebugAuditView` doesn't store `deterministicData`. Instead of embedding a chart (requires un-stored data), show a "View current projections →" link for projection-type insights. Noted as future enhancement.

**Client vs Server**: InsightHistoryPanel is `"use client"` for URL params + SWR. Detail page is a server-side fetch. Insights page keeps `"use client"` for the Chat tab.

**Type labels**:
- `portfolio-summary` → Summary
- `future-projections` → Projections
- `risk-analysis` → Risk
- `rebalancing` → Rebalancing
- `natural-language-query` → Q&A
- `projection-quality-review` → Projection Review
- `retirement-readiness` → Retirement

**Re-run action**: For the history card, "Re-run" navigates to the insights page with the Chat tab active (simpler than triggering the API directly — avoids prop drilling and toast edge cases).
