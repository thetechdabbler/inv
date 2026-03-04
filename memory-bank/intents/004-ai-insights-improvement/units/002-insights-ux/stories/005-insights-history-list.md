---
id: 005-insights-history-list
unit: 002-insights-ux
intent: 004-ai-insights-improvement
status: draft
priority: should
created: 2026-03-04T00:00:00Z
assigned_bolt: 024-insights-ux
implemented: false
---

# Story: 005-insights-history-list

## User Story

**As an** investor
**I want** to see my past AI insights grouped by type with timestamps and filters
**So that** I can quickly find a specific insight I generated earlier and understand my insight history at a glance

## Acceptance Criteria

- [ ] **Given** the AI Insights page loads, **When** the history panel renders, **Then** insights are grouped by type (Summary, Projections, Risk, Rebalancing, Q&A) with a count badge per group
- [ ] **Given** insights are displayed, **When** I view each entry, **Then** I see: insight type, a short auto-generated title (first 60 chars of narrative), and a formatted timestamp
- [ ] **Given** the filter panel is visible, **When** I filter by account, type, or date range, **Then** only matching insights are shown and the URL params update to preserve filter state
- [ ] **Given** more than 20 insights exist, **When** the page loads, **Then** only the 20 most recent are shown with a "Load more" control
- [ ] **Given** no insights exist yet, **When** the history panel renders, **Then** an empty state is shown with a prompt to generate the first insight

## Technical Notes

- Insights history is sourced from the existing audit trail API (`/api/v1/insights/audit`) — extend it to return grouped/filtered results with pagination
- Filter state: `accountId`, `type`, `from`, `to` — stored in URL params (`useSearchParams`)
- Grouping is client-side from the returned flat list
- Short title: truncate `llmNarrative` at 60 chars with ellipsis; strip markdown before truncating
- Use existing `shadcn/ui` components: `Tabs` for groups, `Badge` for counts, `Select` for filters

## Dependencies

### Requires
- 004-guardrails-and-audit (audit API has enriched telemetry fields)

### Enables
- 006-insight-cards-actions (cards are used within the history list)
- 007-insight-detail-view (clicking an entry opens detail view)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Insight has empty narrative | Title shows "—" placeholder |
| Audit API returns error | Error state shown with retry button |
| All filters applied with no matches | Empty state shown with "Clear filters" link |
| Date range filter: `from` > `to` | Validation error shown inline; request not sent |

## Out of Scope

- Deleting individual insights from history (future)
- Exporting insight history as CSV (future)
- Real-time updates when a new insight is generated (future)
