---
stage: test
bolt: 020-valuation-gratuity
created: 2026-03-03T19:22:30.000Z
---

## Test Report: Valuation Engine — Gratuity

### Summary

- **Tests**: 5/5 passed (unit tests for gratuity calculator).
- **Coverage**: Focused on core calculation and edge cases for years of service and formula.

### Test Files

- [x] `tests/unit/valuation-gratuity.test.ts` — covers `computeGratuitySuggestion` domain helper behavior.

### Acceptance Criteria Validation

- ✅ **Years of service computation**:
  - Verified full-year calculation between joining date and as-of date, including off-by-one behavior when the as-of date is just before the anniversary.
- ✅ **Non-gratuity accounts**:
  - Confirmed that suggestions are not produced for non-gratuity account types.
- ✅ **Invalid or insufficient inputs**:
  - Confirmed that zero suggestion is returned when years of service ≤ 0 or salary is non-positive.
- ✅ **Gratuity formula and rounding**:
  - Confirmed that `(15/26) × S × Y` is applied with two-decimal rounding for valid inputs (e.g., S = 50,000, Y = 10).

### Issues Found

- None observed during this test run.

### Notes

- Integration from the application layer helper (`computeGratuitySuggestionForAccount`) is straightforward and can be exercised in higher-level tests once the UI/API starts consuming it.

