---
id: 001-create-account
unit: 001-portfolio-core
intent: 001-investment-tracker
status: draft
priority: must
created: 2026-03-02T10:30:00Z
assigned_bolt: 001-portfolio-core
implemented: false
---

# Story: 001-create-account

## User Story

**As a** user
**I want** to create a new investment account with a type, name, description, and initial balance
**So that** I can start tracking an investment from my current position

## Acceptance Criteria

- [ ] **Given** I provide a valid account type (bank_deposit, stocks, mutual_fund, ppf, epf, nps, gratuity), name, and initial balance, **When** I submit the form, **Then** the account is persisted in SQLite via Prisma
- [ ] **Given** I create an account with an initial balance, **When** the account is created, **Then** an initial valuation record is automatically created with the same value and date
- [ ] **Given** I omit required fields (type, name, initial balance), **When** I submit, **Then** I receive validation errors

## Technical Notes

- Account types should be a Prisma enum
- Initial balance should create both the account record and an initial Valuation record
- API route: POST /api/v1/accounts

## Dependencies

### Requires
- None (first story — defines the Prisma schema)

### Enables
- 002-list-accounts
- 003-update-account
- 004-delete-account
- All transaction/valuation stories

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Duplicate account name | Allowed (names are not unique) |
| Zero initial balance | Allowed |
| Negative initial balance | Validation error |
| Very long name (255+ chars) | Validation error |

## Out of Scope

- Account-specific settings (interest rate, compounding) — handled by valuation-engine
- Bulk account creation
