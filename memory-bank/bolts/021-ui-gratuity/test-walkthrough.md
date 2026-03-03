---
stage: test
bolt: 021-ui-gratuity
created: 2026-03-03T19:42:00.000Z
---

## Test Report: Investment Tracker UI — Gratuity

### Summary

- **Tests**: Existing unit and API test suites pass except for known unrelated valuation-rate and MF/stock market-config tests; the gratuity-specific unit test (`valuation-gratuity`) passes.
- **Coverage**: UI behavior for gratuity flows was manually exercised in the browser while backend/domain helpers were validated via unit tests.

### Test Files

- [x] `tests/unit/valuation-gratuity.test.ts` — validates years-of-service logic and the gratuity formula used by the domain helper.
- [x] `tests/unit/animations-polish-structure.test.ts` and other structure tests — ensure overall app structure remains consistent after UI changes.

### Acceptance Criteria Validation

- ✅ Gratuity accounts show salary and joining date fields on the valuation form.
- ✅ When valid salary, joining date, and valuation date are provided, the form presents a gratuity-focused helper message and allows users to base their input on those values.
- ✅ Users can edit the valuation amount field before saving and the stored valuation reflects the final edited value.
- ✅ Non-gratuity accounts do not show the gratuity-specific helper fields or copy and behave exactly as before.

### Issues Found

- Existing unrelated API tests for valuation rate configuration and MF/stock market valuation currently fail due to known setup issues; these predate this bolt and will be addressed separately.

### Notes

- A future enhancement can add component-level tests around the gratuity-specific inputs and any eventual call to the backend helper/API to prevent regressions in this flow.

