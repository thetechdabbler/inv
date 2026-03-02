---
id: 005-log-investment
unit: 001-portfolio-core
intent: 001-investment-tracker
status: complete
priority: must
created: 2026-03-02T10:30:00.000Z
assigned_bolt: 002-portfolio-core
implemented: true
---

# Story: 005-log-investment

## User Story

**As a** user
**I want** to record an investment (deposit/contribution) to an account
**So that** I can track how much I've invested over time

## Acceptance Criteria

- [ ] **Given** a valid account, date, and positive amount, **When** I log an investment, **Then** a transaction record of type "investment" is created
- [ ] **Given** an investment is logged, **When** I view the account, **Then** total contributions increase by the investment amount
- [ ] **Given** I provide an optional description, **When** the investment is logged, **Then** the description is stored with the transaction

## Technical Notes

- API route: POST /api/v1/transactions
- Request body: { accountId, date, amount, type: "investment", description? }
- Amount must be positive
- Date defaults to current date if not provided

## Dependencies

### Requires
- 001-create-account (needs an account to invest into)

### Enables
- 008-view-account-history
- 009-compute-performance

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Zero amount | Validation error |
| Negative amount | Validation error |
| Future date | Allowed (pre-scheduling) |
| Non-existent account | 404 error |

## Out of Scope

- Recurring/scheduled investments
- Investment categories or tags
