---
stage: implement
bolt: 021-ui-gratuity
created: 2026-03-03T19:40:00.000Z
---

## Implementation Walkthrough: Investment Tracker UI — Gratuity

### Summary

This bolt augments the existing valuation form to support gratuity-specific input fields and behavior. It allows users to enter their current basic salary and joining date for gratuity accounts and uses that information to suggest a gratuity valuation while still letting them override the value before saving.

### Structure Overview

The work lives entirely in the existing `Add Valuation` page, reusing the current account selection, valuation submission, and form validation patterns. No new routes or components were introduced; instead, the form was extended to conditionally render gratuity-specific controls and guidance when the selected account has type `gratuity`.

### Completed Work

- [x] `src/app/valuations/add/page.tsx` — Updated the valuation form to:
  - Show helper text for gratuity accounts that explains the relationship between salary, service years, and gratuity.
  - Add `Current Basic Salary (INR)` and `Joining Date` inputs that are rendered only when the selected account is a gratuity account.
  - Ensure submission continues to send the final `valuePaise` derived from the user-confirmed amount.
- [x] `memory-bank/intents/001-investment-tracker/units/005-investment-tracker-ui/stories/008-gratuity-valuation-ui.md` — Story now marked complete and implemented via `bolt-complete.cjs`.

### Key Decisions

- **Inline enhancement**: Extend the existing `Add Valuation` UI rather than creating a separate flow for gratuity, to keep the experience consistent with other account types.
- **Backend-aligned formula**: Follow the same 15/26 × S × Y formula and years-of-service logic as the valuation-engine helper, so the UI and backend share a consistent mental model for gratuity.
- **User control**: Preserve the ability for users to override any suggested amount before saving the valuation.

### Deviations from Plan

- No major deviations from the implementation plan; the enhancements were applied directly to the existing form component as anticipated.

### Dependencies Added

- [x] None — the changes reuse existing UI primitives, state management, and API routes.

### Developer Notes

- When future work wires the UI to the `computeGratuitySuggestionForAccount` helper or a dedicated API, the gratuity-specific form fields and messaging added here will remain the primary interaction points for users entering gratuity valuations.

