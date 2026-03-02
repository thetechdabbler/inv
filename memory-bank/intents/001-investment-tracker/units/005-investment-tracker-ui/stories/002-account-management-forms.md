---
id: 002-account-management-forms
unit: 005-investment-tracker-ui
intent: 001-investment-tracker
status: draft
priority: must
created: 2026-03-02T10:30:00Z
assigned_bolt: 009-investment-tracker-ui
implemented: false
---

# Story: 002-account-management-forms

## User Story

**As a** user
**I want** forms to create, edit, and delete investment accounts
**So that** I can manage my tracked investments through the UI

## Acceptance Criteria

- [ ] **Given** I click "Add Account", **When** the form appears, **Then** I can select account type from a dropdown, enter name, description, and initial balance with real-time validation
- [ ] **Given** I click edit on an existing account, **When** the form appears, **Then** it is pre-filled with current values and I can update name, description, or type
- [ ] **Given** I click delete on an account, **When** a confirmation dialog appears and I confirm, **Then** the account and all related data are deleted

## Technical Notes

- Use React Hook Form for form state management
- Account type dropdown: bank_deposit, stocks, mutual_fund, ppf, epf, nps, gratuity
- Validation: name required (max 100 chars), initial balance >= 0, type required
- Toast notification on success/failure

## Dependencies

### Requires
- portfolio-core APIs (CRUD endpoints)

### Enables
- 003-transaction-valuation-forms

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Form submission while offline | Show error, preserve form data |
| Very long description | Allow but truncate in display |
| Delete with many related records | Show warning about cascade deletion |

## Out of Scope

- Bulk account operations
- Account templates or presets
