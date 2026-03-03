---
id: 008-gratuity-valuation-ui
unit: 005-investment-tracker-ui
intent: 001-investment-tracker
status: complete
priority: should
created: 2026-03-03T19:00:00.000Z
implemented: true
---

# Story: 008-gratuity-valuation-ui

## User Story

**As a** user with a gratuity account  
**I want** the valuation form to accept my current basic salary and joining date and prefill a suggested gratuity amount  
**So that** I can record gratuity valuations without doing the calculation manually

## Acceptance Criteria

- [ ] **Given** I select a gratuity account and open the “Add Valuation” form, **Then** I see additional inputs for “Current Basic Salary (INR)” and “Joining Date” alongside date and current value.
- [ ] **Given** I enter a valid basic salary and joining date, and the valuation date is after the joining date, **When** the helper runs, **Then** the “Current Value (INR)” field updates to the suggested gratuity based on the backend formula.
- [ ] **Given** the computed suggestion is shown, **When** I manually change the amount, **Then** the overridden value is what gets submitted and stored, not the original suggestion.
- [ ] **Given** the joining date is after or equal to the valuation date, or years of service is ≤ 0, **When** I try to use the helper, **Then** no positive gratuity value is suggested and the UI indicates that years of service are insufficient.
- [ ] **Given** I am on a non-gratuity account, **When** I open the valuation form, **Then** the gratuity-specific helper fields are not displayed.

## Technical Notes

- Implement gratuity-specific helper fields only when the selected account has `type === "gratuity"`.
- Use a shared helper from the valuation-engine (006-gratuity-suggestion) or replicate the same formula in a small, well-documented calculation utility to compute the suggestion.
- Ensure the helper runs reactively on changes to salary, joining date, or valuation date, but does not prevent the user from overriding the computed amount.
- Provide a short help text or tooltip explaining that gratuity is derived from basic salary, joining date, and years of service.

## Dependencies

### Requires
- 002-valuation-engine (gratuity suggestion calculation)
- 003-transaction-valuation-forms (base valuation form behavior)

### Enables
- None directly

