---
id: 006-log-withdrawal
unit: 001-portfolio-core
intent: 001-investment-tracker
status: complete
priority: must
created: 2026-03-02T10:30:00.000Z
assigned_bolt: 002-portfolio-core
implemented: true
---

# Story: 006-log-withdrawal

## User Story

**As a** user
**I want** to record a withdrawal from an account
**So that** I can track money I've taken out and see accurate net contributions

## Acceptance Criteria

- [ ] **Given** a valid account, date, and positive amount, **When** I log a withdrawal, **Then** a transaction record of type "withdrawal" is created
- [ ] **Given** a withdrawal is logged, **When** I view the account, **Then** net contributions decrease by the withdrawal amount
- [ ] **Given** I provide an optional description, **When** the withdrawal is logged, **Then** the description is stored

## Technical Notes

- API route: POST /api/v1/transactions
- Request body: { accountId, date, amount, type: "withdrawal", description? }
- Amount is always positive; the type "withdrawal" indicates direction
- No check against current balance — user may withdraw more than invested (e.g., gains)

## Dependencies

### Requires
- 001-create-account
- 005-log-investment (conceptually paired)

### Enables
- 008-view-account-history
- 009-compute-performance

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Withdrawal exceeding total investments | Allowed (returns/gains may cover) |
| Zero amount | Validation error |
| Multiple withdrawals same day | All recorded separately |

## Out of Scope

- Withdrawal restrictions based on account type (e.g., PPF lock-in)
- Tax implications tracking
