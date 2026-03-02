---
id: 009-compute-performance
unit: 001-portfolio-core
intent: 001-investment-tracker
status: draft
priority: must
created: 2026-03-02T10:30:00Z
assigned_bolt: 002-portfolio-core
implemented: false
---

# Story: 009-compute-performance

## User Story

**As a** user
**I want** to see my total contributions, withdrawals, current value, profit/loss, and percentage returns for each account
**So that** I can evaluate how my investments are performing

## Acceptance Criteria

- [ ] **Given** an account with transactions and a latest valuation, **When** I request performance, **Then** I see total contributions (sum of investments), total withdrawals, net invested (contributions - withdrawals), current value (latest valuation), absolute P&L (current value - net invested), and percentage return ((current value - net invested) / net invested × 100)
- [ ] **Given** an account with no transactions beyond initial balance, **When** I request performance, **Then** net invested equals initial balance and P&L is calculated against it
- [ ] **Given** I request portfolio-level performance, **When** computed, **Then** I see aggregated metrics across all accounts

## Technical Notes

- API route: GET /api/v1/accounts/:id/performance and GET /api/v1/portfolio/performance
- Percentage return: ((currentValue - netInvested) / netInvested) * 100
- Handle edge case where netInvested = 0 (avoid division by zero)
- Consider XIRR for annualized returns in future iteration

## Dependencies

### Requires
- 005-log-investment, 006-log-withdrawal, 007-log-valuation (needs data for computation)

### Enables
- None directly (consumed by dashboard UI)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Net invested = 0 (all withdrawn) | Percentage return = N/A or infinity |
| No valuation exists | Current value = initial balance |
| Negative P&L | Displayed as negative value |
| Account just created | P&L = 0, return = 0% |

## Out of Scope

- Time-weighted returns (TWR)
- XIRR calculation
- Benchmark comparison
