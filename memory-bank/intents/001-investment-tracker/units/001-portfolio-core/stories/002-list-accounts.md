---
id: 002-list-accounts
unit: 001-portfolio-core
intent: 001-investment-tracker
status: complete
priority: must
created: 2026-03-02T10:30:00.000Z
assigned_bolt: 001-portfolio-core
implemented: true
---

# Story: 002-list-accounts

## User Story

**As a** user
**I want** to view all my investment accounts with their current values and contributions
**So that** I can see an overview of my portfolio

## Acceptance Criteria

- [ ] **Given** I have created accounts, **When** I request the account list, **Then** I see each account's type, name, initial balance, current value (latest valuation), and total contributions
- [ ] **Given** an account has no valuation records beyond the initial, **When** listed, **Then** current value shows the initial balance
- [ ] **Given** an account has multiple valuations, **When** listed, **Then** current value reflects the most recent valuation

## Technical Notes

- Current value = latest Valuation record's value
- Total contributions = sum of all investment transactions
- API route: GET /api/v1/accounts
- Consider pagination for large account lists

## Dependencies

### Requires
- 001-create-account (needs accounts to exist)

### Enables
- None directly

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| No accounts exist | Return empty array |
| Account with no transactions | Show initial balance as total contributions |

## Out of Scope

- Filtering or sorting accounts (handled by UI filtering story)
- Account grouping by type
