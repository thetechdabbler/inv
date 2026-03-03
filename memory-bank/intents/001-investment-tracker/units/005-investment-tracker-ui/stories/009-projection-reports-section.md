---
id: 009-projection-reports-section
unit: 005-investment-tracker-ui
intent: 001-investment-tracker
status: planned
priority: should
created: 2026-03-03T10:05:00.000Z
---

# Story: 009-projection-reports-section

## User Story

**As a** user  
**I want** a dedicated projections section that shows Monthly, QoQ, and YoY reports of invested capital, profit, and total value  
**So that** I can quickly understand how my portfolio may grow over different time horizons

## Acceptance Criteria

- [ ] **Given** I am logged in, **When** I navigate to the Projections section from the main navigation or dashboard, **Then** I see a dedicated view that is clearly separated from the current-value dashboard.
- [ ] **Given** the Projections section is open with scope set to “Portfolio”, **When** projections load, **Then** I see:
  - a Monthly table for at least the next 12 months,
  - a QoQ table for at least the next 5 years,
  - a YoY table for at least the next 30 years,
  each with period label, invested capital, profit, and total value columns.
- [ ] **Given** I switch scope from “Portfolio” to a specific account, **When** the UI refreshes, **Then** the Monthly, QoQ, and YoY tables update to show projections for that account only.
- [ ] **Given** projections are loading, **When** I open or change scope/horizon, **Then** I see appropriate loading indicators or skeletons instead of stale or partial data.
- [ ] **Given** the projections API returns an error or is unavailable, **When** I view the Projections section, **Then** the UI shows a clear error message and does not display misleading numbers.
- [ ] **Given** projections are displayed, **When** I view the page, **Then** I see a prominent disclaimer that projections are estimates only and not financial advice, along with a way to inspect or understand the key assumptions (rate, contribution, horizon).

## Technical Notes

- Add a Projections route/section in the UI (e.g. `/projections` or a tab on the dashboard) using existing layout components.
- Use tabs or segmented controls to switch between Monthly, QoQ, and YoY views, while reusing shared table and optional chart components.
- Consume a deterministic projections API (e.g. `GET /api/v1/projections`) rather than calling the LLM directly; structure client types to align with the backend payload.
- Consider adding simple line or area charts above the tables to visualize projected total value over time for the selected scope.

## Dependencies

### Requires

- 001-portfolio-core projection engine story (010-deterministic-projection-engine) implemented and exposed via API.
- 005-investment-tracker-ui core layout and navigation (dashboard, routing).

### Enables

- Future UX enhancements for goal-based planning and comparative scenario views.

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Very small numbers (e.g. ₹1 contributions) | Still render tables with rounded values and clear formatting |
| Very large horizons configured by user | Clamp or communicate limits while keeping UI responsive |
| Narrow mobile screens | Tables and charts remain usable with horizontal scrolling or responsive stacking |

## Out of Scope

- Editing expected rate of return or expected investment directly inside the projections view (handled via account edit flows).
- LLM-powered narrative projections or recommendations (covered by llm-insights unit).

