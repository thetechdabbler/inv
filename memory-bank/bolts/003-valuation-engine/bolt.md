---
id: 003-valuation-engine
unit: 002-valuation-engine
intent: 001-investment-tracker
type: ddd-construction-bolt
status: complete
stories:
  - 001-ppf-calculation
  - 002-epf-calculation
  - 003-deposit-calculation
created: 2026-03-02T10:35:00.000Z
started: 2026-03-02T16:30:00.000Z
completed: "2026-03-02T14:59:37Z"
current_stage: null
stages_completed:
  - name: model
    completed: 2026-03-02T16:35:00.000Z
    artifact: ddd-01-domain-model.md
  - name: design
    completed: 2026-03-02T16:45:00.000Z
    artifact: ddd-02-technical-design.md
  - name: adr
    completed: 2026-03-02T16:50:00.000Z
    artifact: none
  - name: implement
    completed: 2026-03-02T17:30:00.000Z
    artifact: src/
  - name: test
    completed: 2026-03-02T17:45:00.000Z
    artifact: ddd-03-test-report.md
requires_bolts:
  - 002-portfolio-core
enables_bolts:
  - 004-valuation-engine
requires_units:
  - 001-portfolio-core
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 2
  max_dependencies: 2
  testing_scope: 2
---

# Bolt: 003-valuation-engine

## Overview

First bolt for the valuation engine. Implements interest calculation modules for PPF, EPF, and bank deposits using government-notified rates.

## Objective

Build calculation engines for predictable instruments so account values can be auto-computed without manual entry.

## Stories Included

- **001-ppf-calculation**: PPF returns at 7.1% p.a. (Should)
- **002-epf-calculation**: EPF returns at 8.25% p.a. (Should)
- **003-deposit-calculation**: Bank deposit interest with configurable rate/frequency (Should)

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
- 002-portfolio-core (Account, Transaction, Valuation models and data)

### Enables
- 004-valuation-engine (market data fetchers)

## Success Criteria

- [ ] PPF calculation within 0.1% of government formula
- [ ] EPF calculation within 0.1% of official formula
- [ ] Deposit calculation correct for monthly/quarterly/annual compounding
- [ ] User-configurable interest rates
- [ ] Calculations create Valuation records
- [ ] Unit tests with known values

## Notes

- PPF: interest on lowest balance between 5th and last day of month, compounded annually
- EPF: monthly interest on running balance, credited annually
- Deposit: A = P(1 + r/n)^(nt)
- All calculators should be pluggable (strategy pattern) for extensibility
