---
id: 006-gratuity-suggestion
unit: 002-valuation-engine
intent: 001-investment-tracker
status: complete
priority: should
created: 2026-03-03T19:00:00.000Z
implemented: true
---

# Story: 006-gratuity-suggestion

## User Story

**As a** user with a gratuity account  
**I want** the system to compute a suggested gratuity value from my current basic salary and joining date  
**So that** I don’t have to calculate gratuity manually and can keep valuations consistent

## Acceptance Criteria

- [ ] **Given** a gratuity account and inputs for current basic salary (S), joining date (J), and valuation date (D), **When** I request a suggestion, **Then** the system computes years of service Y as the full number of years between J and D.
- [ ] **Given** S, J, and D such that Y ≥ 1, **When** the suggestion is computed, **Then** the suggested gratuity equals (15/26) × S × Y, rounded to two decimal places.
- [ ] **Given** D ≤ J or Y ≤ 0, **When** I request a suggestion, **Then** the function does not return a positive gratuity amount and indicates that years of service are insufficient.
- [ ] **Given** invalid inputs (e.g., non-numeric salary, invalid dates), **When** the function is called, **Then** it fails safely (returns 0 or null) without throwing and logs enough context for debugging.

## Technical Notes

- Implement a pure calculation helper (no I/O) that takes salary (number), joiningDate (ISO string), and valuationDate (ISO string or Date) and returns a suggested gratuity amount in INR.
- Use a consistent “years of service” calculation across the app (e.g., floor of year difference based on calendar dates, not timezones).
- Keep the formula and any magic numbers (15, 26) centralized so they can be adjusted later if the business rule changes.

## Dependencies

### Requires
- portfolio-core unit (Account and Valuation models)

### Enables
- 008-gratuity-valuation-ui (frontend use of this suggestion)

