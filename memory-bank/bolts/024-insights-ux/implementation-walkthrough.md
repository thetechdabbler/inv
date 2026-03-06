# Implementation Walkthrough — Bolt 024-insights-ux

## Files Changed

### 1. `src/infrastructure/prisma/llm-query-repository.ts` (modified)
Added `type?: string`, `from?: Date`, `to?: Date` to `findAllLLMQueries` options. Builds a Prisma `where` clause with `insightType` equality and `createdAt` range filter. Returns `{ records, total }` for pagination.

### 2. `src/app/api/v1/insights/history/route.ts` (modified)
Parses `?type=`, `?from=`, `?to=` query params. Passes them to `findAllLLMQueries`. `from`/`to` parsed via `new Date()`.

### 3. `src/components/insights/InsightCard.tsx` (new)
Client component rendering a single `LLMInteraction` as a card:
- Type badge via `TYPE_META` lookup + "Failed" destructive badge on error
- Timestamp + external link icon → `/insights/${insight.id}` (detail page)
- Narrative split from disclaimer on `"\n\n⚠️"`; truncated to 200 chars with expand/collapse
- Disclaimer shown in muted `bg-muted/50` block
- Quick actions by type:
  - projection types → "View projections" → `/projections`
  - summary/risk → "Dashboard" → `/dashboard`
  - rebalancing → "Accounts" → `/accounts`
- `onRerun` prop → navigates to `/insights?tab=chat`

### 4. `src/components/insights/InsightHistoryPanel.tsx` (new)
Client component with full filter + pagination UX:
- Reads `insightType`, `from`, `to` from URL search params
- 7-tab `Tabs` component (All + 6 insight types) with count badges from accumulated list
- Date inputs (`id="filter-from"`, `id="filter-to"`) with `htmlFor` labels for a11y
- Apply / Clear buttons update URL params via `router.replace()`
- `useSWR` fetches from `/api/v1/insights/history` with current filters
- Accumulated pages list with dedup by `id` ("Load more" offset pagination)
- Skeletons on initial load, error retry, empty state with filter-clear or Chat tab link

### 5. `src/app/insights/page.tsx` (modified)
Redesigned from single-panel to two-tab layout:
- "History" tab → `<InsightHistoryPanel />`
- "Chat" tab → `<InsightChat />`
- Tab state driven by `?tab=chat` URL param (via `useSearchParams` + `useEffect`)
- Outer `<Suspense>` wrapper required by Next.js for `useSearchParams`

### 6. `src/app/insights/[auditId]/page.tsx` (new)
Server component detail page:
- Fetches `/api/v1/insights/debug/:auditId` via internal `fetch()` (no-store)
- `notFound()` on 404
- Back button → `/insights`
- Narrative rendered with `ReactMarkdown` (prose styles); disclaimer in muted block
- For projection types (`future-projections`, `projection-quality-review`): shows card with link to `/projections` (stored `deterministicData` not available from audit record)
- Metadata card: model, tokens (hidden if null), duration (hidden if null), template + version, ISO timestamp

## Design Decisions

- **Disclaimer splitting**: both `InsightCard` and the detail page split on `"\n\n⚠️"` — matches `appendDisclaimer()` output from bolt 023
- **No embedded projection chart in detail page**: `DebugAuditView` doesn't store `deterministicData`; link to `/projections` instead (future enhancement noted)
- **URL param state for filters**: preserves filter state on browser back/forward navigation
- **Count badges**: count comes from `accumulated` list, not from `data.total`, so they reflect loaded items not the full filtered count — acceptable for this scope
