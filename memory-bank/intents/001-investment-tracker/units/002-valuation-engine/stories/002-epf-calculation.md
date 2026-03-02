---
id: 002-epf-calculation
unit: 002-valuation-engine
intent: 001-investment-tracker
status: draft
priority: should
created: 2026-03-02T10:30:00Z
assigned_bolt: 003-valuation-engine
implemented: false
---

# Story: 002-epf-calculation

## User Story

**As a** user
**I want** the system to automatically calculate my EPF account's current value using the official interest rate
**So that** I can track my provident fund growth accurately

## Acceptance Criteria

- [ ] **Given** an EPF account with monthly contributions, **When** I trigger calculation, **Then** interest is computed at 8.25% p.a. with monthly compounding and annual crediting
- [ ] **Given** the interest rate changes, **When** I update the rate, **Then** subsequent calculations use the new rate
- [ ] **Given** the calculation completes, **When** stored, **Then** a new Valuation record is created

## Technical Notes

- EPF interest: calculated monthly on running balance, credited annually
- Default rate: 8.25% p.a. (FY 2025-26)
- Monthly rate = annual rate / 12
- API route: POST /api/v1/valuations/compute/epf/:accountId

## Dependencies

### Requires
- portfolio-core unit (Account, Transaction, Valuation models)

### Enables
- None directly

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| No contribution in a month | Interest still accrues on existing balance |
| Withdrawal from EPF | Reduces running balance for future interest |
| Rate change mid-year | Apply proportionally |

## Out of Scope

- EPF vs EPS split (employer contribution division)
- EPF withdrawal rules
- Tax on EPF interest above threshold
