---
id: 008-view-account-history
unit: 001-portfolio-core
intent: 001-investment-tracker
status: complete
priority: must
created: 2026-03-02T10:30:00.000Z
assigned_bolt: 002-portfolio-core
implemented: true
---

# Story: 008-view-account-history

## User Story

**As a** user
**I want** to view all investments, withdrawals, and valuations for an account in chronological order
**So that** I can understand the full history of an account

## Acceptance Criteria

- [ ] **Given** an account with transactions and valuations, **When** I request history, **Then** all records are returned in chronological order (oldest first)
- [ ] **Given** the history request includes a date range, **When** filtered, **Then** only records within that range are returned
- [ ] **Given** the history, **When** displayed, **Then** each entry shows date, type (investment/withdrawal/valuation), amount/value, and description

## Technical Notes

- API route: GET /api/v1/accounts/:id/history?from=&to=
- Combine Transaction and Valuation records, sort by date
- Return a unified format: { date, type, amount, description }
- Support pagination for accounts with many records

## Dependencies

### Requires
- 005-log-investment, 006-log-withdrawal, 007-log-valuation (needs data to display)

### Enables
- None directly (consumed by UI)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Account with no history | Return empty array |
| Multiple entries on same date | All shown, ordered by creation time |
| Very large history (10K+ records) | Paginated response |

## Out of Scope

- History across multiple accounts (portfolio-level view)
- History export (handled by auth-security data export)
