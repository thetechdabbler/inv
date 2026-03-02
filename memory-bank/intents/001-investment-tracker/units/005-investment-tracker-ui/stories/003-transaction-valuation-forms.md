---
id: 003-transaction-valuation-forms
unit: 005-investment-tracker-ui
intent: 001-investment-tracker
status: complete
priority: must
created: 2026-03-02T10:30:00.000Z
assigned_bolt: 009-investment-tracker-ui
implemented: true
---

# Story: 003-transaction-valuation-forms

## User Story

**As a** user
**I want** forms to record investments, withdrawals, and valuation updates
**So that** I can log financial activity through the UI

## Acceptance Criteria

- [ ] **Given** I select an account, **When** I open the transaction form, **Then** I can choose type (investment/withdrawal), enter date, amount, and optional description
- [ ] **Given** I want to update a valuation, **When** I open the valuation form, **Then** I can enter date and current value for the selected account
- [ ] **Given** I submit a valid form, **When** the API responds successfully, **Then** I see a success toast and the dashboard/account view refreshes

## Technical Notes

- Date picker defaulting to today
- Amount field with INR formatting
- Separate forms or tabbed interface for transaction vs valuation
- Show account's current value and last transaction for context

## Dependencies

### Requires
- portfolio-core APIs (transaction and valuation endpoints)
- 002-account-management-forms (account must exist)

### Enables
- None directly

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Future date | Allowed with visual indicator |
| Very large amounts | Format properly, no overflow |
| Quick successive submissions | Debounce to prevent duplicates |

## Out of Scope

- Batch transaction entry
- Transaction editing or deletion (future enhancement)
- Receipt/document attachment
