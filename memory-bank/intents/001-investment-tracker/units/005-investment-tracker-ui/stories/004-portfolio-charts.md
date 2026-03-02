---
id: 004-portfolio-charts
unit: 005-investment-tracker-ui
intent: 001-investment-tracker
status: complete
priority: must
created: 2026-03-02T10:30:00.000Z
assigned_bolt: 010-investment-tracker-ui
implemented: true
---

# Story: 004-portfolio-charts

## User Story

**As a** user
**I want** charts to visualize my portfolio's performance and allocation
**So that** I can understand trends and distribution visually

## Acceptance Criteria

- [ ] **Given** valuation history exists, **When** I view charts, **Then** a line chart shows account values over time
- [ ] **Given** transaction data exists, **When** I view charts, **Then** a bar chart shows contributions vs returns by account or period
- [ ] **Given** multiple account types exist, **When** I view allocation, **Then** a pie chart shows percentage allocation by account type

## Technical Notes

- Use Recharts (or Chart.js) for rendering
- Line chart: x-axis = date, y-axis = value, one series per account
- Bar chart: grouped bars for contributions and current value
- Pie chart: slices by account type with percentages
- Charts should be responsive and support tooltips

## Dependencies

### Requires
- portfolio-core APIs (valuation history, performance)

### Enables
- None directly

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Single data point | Show point with no line |
| Many accounts (10+) | Group smaller accounts into "Other" for pie chart |
| No data | Show empty chart with message |

## Out of Scope

- Chart export to PNG/PDF
- Interactive chart editing
- Benchmark overlay lines
