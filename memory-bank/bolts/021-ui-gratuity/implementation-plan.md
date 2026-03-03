---
stage: plan
bolt: 021-ui-gratuity
created: 2026-03-03T19:30:00.000Z
---

## Implementation Plan: Investment Tracker UI — Gratuity

### Objective

Enhance the valuation form for gratuity accounts so that it accepts current basic salary and joining date, calls the backend gratuity helper, and pre-fills a suggested gratuity amount while still allowing users to override the value before saving.

### Deliverables

- Additional **Current Basic Salary (INR)** and **Joining Date** fields shown only when the selected account type is `gratuity` on the `Add Valuation` page.
- Hook-up between the valuation form and the new application helper `computeGratuitySuggestionForAccount`, using the selected account, salary, joining date, and valuation date.
- Automatic update of the **Current Value (INR)** field with the suggested gratuity when valid inputs are present, without blocking manual edits.
- Clear helper text explaining how the suggestion is derived (salary × years of service via the 15/26 formula).
- Regression-safe behavior for non-gratuity accounts (no extra fields or behavior changes).

### Dependencies

- 009-investment-tracker-ui: Base valuation form and account selection UX already implemented.
- 004-valuation-engine: Existing valuation engine infrastructure and types.
- 020-valuation-gratuity: Domain and application helpers for gratuity suggestions.
- Existing `Add Valuation` page: `src/app/valuations/add/page.tsx`.

### Technical Approach

- Extend the existing `Add Valuation` form logic to:
  - Detect the selected account type and gate gratuity-specific UI behind `type === "gratuity"`.
  - Track `basicSalaryInr` and `joiningDate` in local form state.
  - When all of `{selectedAccountId, basicSalaryInr, joiningDate, date}` are valid, call a thin client-side helper that either:
    - Calls a small backend function via an internal API route that delegates to `computeGratuitySuggestionForAccount`, or
    - (Short term) reuses the same calculation logic in the UI while the backend helper is wired in.
  - Update the `valueInr` form field with the suggested amount, but allow the user to override it manually before submission.
- Preserve the existing submission path (POST `/api/v1/valuations`) so persisted valuations remain standard and independent of how the suggestion was computed.
- Add concise helper copy under the valuation amount field for gratuity accounts, explaining that the suggested value is based on salary and years of service and can be edited.

### Acceptance Criteria

- [ ] Gratuity accounts show salary and joining date inputs alongside the valuation date and amount.
- [ ] When valid salary, joining date, and valuation date are provided, the form computes and fills a suggested gratuity amount that matches the backend helper for the same inputs.
- [ ] Users can override the suggested amount and save; the stored valuation reflects the final edited value.
- [ ] Non-gratuity accounts behave exactly as before (no additional fields or auto-fill behavior).

