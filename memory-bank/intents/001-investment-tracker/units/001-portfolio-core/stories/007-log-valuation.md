---
id: 007-log-valuation
unit: 001-portfolio-core
intent: 001-investment-tracker
status: complete
priority: must
created: 2026-03-02T10:30:00.000Z
assigned_bolt: 002-portfolio-core
implemented: true
---

# Story: 007-log-valuation

## User Story

**As a** user
**I want** to record the current value of an account on a specific date
**So that** I can track how my investment's market value changes over time

## Acceptance Criteria

- [ ] **Given** a valid account, date, and value, **When** I log a valuation, **Then** a valuation record is created without modifying the invested principal
- [ ] **Given** a new valuation is logged, **When** I view the account, **Then** the "current value" reflects this latest valuation
- [ ] **Given** multiple valuations exist for the same date, **When** viewing, **Then** the most recently created one is used as current value

## Technical Notes

- API route: POST /api/v1/valuations
- Request body: { accountId, date, value }
- Valuations are independent of transactions — they represent market/computed value
- Both manual entries and automated calculations create Valuation records

## Dependencies

### Requires
- 001-create-account

### Enables
- 008-view-account-history
- 009-compute-performance

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Valuation of zero | Allowed (account may have lost all value) |
| Valuation for past date | Allowed (backfilling) |
| Very large value | Allowed (no upper limit beyond DB constraints) |

## Out of Scope

- Automated valuation computation (valuation-engine unit)
- Valuation scheduling
