---
id: 020-valuation-gratuity
unit: 002-valuation-engine
intent: 001-investment-tracker
type: ddd-construction-bolt
status: complete
stories:
  - 006-gratuity-suggestion
created: 2026-03-03T19:05:00.000Z
started: 2026-03-03T19:10:00.000Z
completed: "2026-03-03T07:54:45Z"
current_stage: null
stages_completed:
  - name: model
    completed: 2026-03-03T19:15:00.000Z
    artifact: ddd-01-domain-model.md
  - name: design
    completed: 2026-03-03T19:20:00.000Z
    artifact: ddd-02-technical-design.md
  - name: implement
    completed: 2026-03-03T19:21:30.000Z
    artifact: src/
  - name: test
    completed: 2026-03-03T19:22:30.000Z
    artifact: ddd-03-test-report.md
requires_bolts:
  - 003-valuation-engine
enables_bolts: []
requires_units:
  - 001-portfolio-core
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 2
  max_dependencies: 2
  testing_scope: 2
---

# Bolt: 020-valuation-gratuity

## Overview

Valuation engine enhancement to add gratuity support by computing a suggested gratuity value from current basic salary and joining date for gratuity accounts.

## Objective

Provide a reusable calculation primitive for gratuity that the UI and APIs can call to suggest a gratuity valuation, based on salary and years of service, while keeping the implementation isolated and easily adjustable.

## Stories Included

- **006-gratuity-suggestion**: Suggest gratuity value from salary and tenure (Should)

## Bolt Type

**Type**: DDD Construction Bolt  
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/ddd-construction-bolt.md`

## Stages

- [ ] **1. Domain Model**: Pending → ddd-01-domain-model.md  
- [ ] **2. Technical Design**: Pending → ddd-02-technical-design.md  
- [ ] **3. Implementation**: Pending → src/  
- [ ] **4. Testing**: Pending → ddd-03-test-report.md

## Dependencies

### Requires
- 003-valuation-engine (core calculators and patterns)

### Enables
- UI bolt(s) that consume gratuity suggestion helpers

### Unit Dependencies

- 001-portfolio-core (Account and Valuation models)

## Success Criteria

- [ ] Gratuity helper function computes years of service consistently from joining date and valuation date.
- [ ] Suggested gratuity equals (15/26) × S × Y (rounded), for valid inputs.
- [ ] Safe handling of invalid inputs and insufficient service years.
- [ ] Unit tests cover typical and edge cases.
- [ ] API or internal service surfaced for UI consumption.

## Notes

- Keep the formula and any domain assumptions clearly documented in the domain model artifact so they can be revisited if business rules change.

