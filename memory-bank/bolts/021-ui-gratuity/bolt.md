---
id: 021-ui-gratuity
unit: 005-investment-tracker-ui
intent: 001-investment-tracker
type: simple-construction-bolt
status: complete
stories:
  - 008-gratuity-valuation-ui
created: 2026-03-03T19:05:00.000Z
started: 2026-03-03T19:30:00.000Z
completed: "2026-03-03T08:12:45Z"
current_stage: null
stages_completed: []
requires_bolts:
  - 009-investment-tracker-ui
  - 004-valuation-engine
  - 020-valuation-gratuity
enables_bolts: []
requires_units:
  - 001-portfolio-core
  - 002-valuation-engine
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 3
  testing_scope: 1
---

# Bolt: 021-ui-gratuity

## Overview

Frontend enhancement bolt to add gratuity-specific helper fields and suggestion behavior to the valuation form for gratuity accounts.

## Objective

Make gratuity valuations easy and consistent for users by wiring the gratuity suggestion helper into the UI, while still allowing manual override of the suggested amount.

## Stories Included

- **008-gratuity-valuation-ui**: Gratuity valuation helper fields and suggestion (Should)

## Bolt Type

**Type**: Simple Construction Bolt  
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/simple-construction-bolt.md`

## Stages

- [ ] **1. Plan**: Pending → implementation-plan.md  
- [ ] **2. Implement**: Pending → Source code + implementation-walkthrough.md  
- [ ] **3. Test**: Pending → test-walkthrough.md

## Dependencies

### Requires
- 009-investment-tracker-ui (base transaction and valuation forms)
- 004-valuation-engine (exposes valuation helpers)
- 020-valuation-gratuity (gratuity suggestion calculation)

### Enables
- None (small focused polish bolt)

### Unit Dependencies

- 001-portfolio-core (account and valuation APIs)
- 002-valuation-engine (gratuity helper)

## Success Criteria

- [ ] Gratuity accounts show salary and joining date fields on the valuation form.
- [ ] Suggested gratuity value is populated based on backend/helper formula.
- [ ] Users can override the suggested value and save successfully.
- [ ] Non-gratuity accounts are unaffected (no extra fields).

## Notes

- Follow existing UI patterns for form controls, validation messages, and helper text so the experience is consistent with the rest of the app.

