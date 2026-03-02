---
id: 001-portfolio-dashboard
unit: 005-investment-tracker-ui
intent: 001-investment-tracker
status: draft
priority: must
created: 2026-03-02T10:30:00Z
assigned_bolt: 009-investment-tracker-ui
implemented: false
---

# Story: 001-portfolio-dashboard

## User Story

**As a** user
**I want** a dashboard summarizing my total portfolio
**So that** I can see my financial position at a glance

## Acceptance Criteria

- [ ] **Given** I have investment accounts, **When** I load the dashboard, **Then** I see total portfolio value, total contributions, unrealised profit/loss (value and percentage), and asset allocation breakdown by account type
- [ ] **Given** portfolio data is loading, **When** the page renders, **Then** I see loading skeletons instead of blank space
- [ ] **Given** I have no accounts, **When** I load the dashboard, **Then** I see an empty state with a CTA to create my first account

## Technical Notes

- Dashboard is the landing page after login
- Use SSR for initial data load, SWR for client-side revalidation
- Summary cards: Total Value, Total Invested, Unrealised P&L, Number of Accounts
- Asset allocation shown as both percentage and absolute values

## Dependencies

### Requires
- portfolio-core APIs (accounts, performance)

### Enables
- None directly

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| API error | Show error state with retry button |
| Very large portfolio value | Format with Indian numbering (lakhs/crores) |
| Negative P&L | Show in red with downward indicator |

## Out of Scope

- Customizable dashboard widgets
- Dashboard sharing or screenshots
