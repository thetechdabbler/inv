---
id: 003-deposit-calculation
unit: 002-valuation-engine
intent: 001-investment-tracker
status: draft
priority: should
created: 2026-03-02T10:30:00Z
assigned_bolt: 003-valuation-engine
implemented: false
---

# Story: 003-deposit-calculation

## User Story

**As a** user
**I want** the system to calculate my bank deposit's current value based on the interest rate and compounding frequency I specify
**So that** I can track deposit growth without manual calculations

## Acceptance Criteria

- [ ] **Given** a bank deposit account with a specified rate and compounding frequency, **When** I trigger calculation, **Then** current value is computed using compound interest formula
- [ ] **Given** compounding frequencies of monthly, quarterly, or annually, **When** calculated, **Then** the correct formula is applied: A = P(1 + r/n)^(nt)
- [ ] **Given** the calculation completes, **When** stored, **Then** a new Valuation record is created

## Technical Notes

- User must specify: interest rate (%) and compounding frequency (monthly/quarterly/annual)
- Store rate and frequency in an InterestRate table linked to account
- API route: POST /api/v1/valuations/compute/deposit/:accountId

## Dependencies

### Requires
- portfolio-core unit (Account, Transaction, Valuation models)

### Enables
- None directly

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Zero interest rate | Value equals principal |
| Additional deposits mid-term | Each deposit compounds separately from its date |
| Premature withdrawal | User logs withdrawal manually; calculation adjusts |

## Out of Scope

- TDS (Tax Deducted at Source) calculations
- FD vs RD distinction (recurring deposits)
- Penalty for premature withdrawal
