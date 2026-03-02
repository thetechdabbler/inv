---
id: 001-ppf-calculation
unit: 002-valuation-engine
intent: 001-investment-tracker
status: complete
priority: should
created: 2026-03-02T10:30:00.000Z
assigned_bolt: 003-valuation-engine
implemented: true
---

# Story: 001-ppf-calculation

## User Story

**As a** user
**I want** the system to automatically calculate my PPF account's current value using the government-notified interest rate
**So that** I don't have to manually compute compound interest

## Acceptance Criteria

- [ ] **Given** a PPF account with transactions, **When** I trigger calculation, **Then** interest is computed at 7.1% p.a. compounded annually on the lowest balance between the 5th and end of each month
- [ ] **Given** the interest rate changes, **When** I update the rate in settings, **Then** subsequent calculations use the new rate
- [ ] **Given** the calculation completes, **When** the result is stored, **Then** a new Valuation record is created for the account

## Technical Notes

- PPF interest is calculated on the lowest balance between 5th and last day of each month
- Interest is compounded annually (credited at end of financial year in March)
- Default rate: 7.1% p.a. (FY 2025-26)
- API route: POST /api/v1/valuations/compute/ppf/:accountId

## Dependencies

### Requires
- portfolio-core unit (Account, Transaction, Valuation models)

### Enables
- None directly

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| No transactions in a month | Use previous balance as lowest |
| Deposit after 5th of month | Does not count for that month's interest |
| Rate change mid-year | Apply old rate for months before change, new rate after |
| Account opened mid-year | Pro-rata calculation from opening month |

## Out of Scope

- PPF maturity and extension rules
- PPF withdrawal rules (partial withdrawal after year 7)
- Tax benefit calculations (Section 80C)
